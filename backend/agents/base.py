import os
import json
import logging
import random
import asyncio
from typing import Type, TypeVar, Any
from pydantic import BaseModel
from groq import AsyncGroq
from openai import AsyncOpenAI
from backend.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)

class BaseAgent:
    def __init__(self):
        # Local Ollama Client (Primary)
        self.ollama_client = AsyncOpenAI(
            base_url="http://localhost:11434/v1",
            api_key="ollama"
        )
        self.ollama_model = "llama3.2:latest"
        
        # Groq Client (Fallback 1)
        self.groq_key = settings.get_groq_api_key
        self.groq_client = AsyncGroq(api_key=self.groq_key) if self.groq_key else None
        self.groq_model = "llama-3.3-70b-versatile"
        
        # OpenRouter Client (Fallback 2)
        self.or_key = settings.OPENROUTER_API_KEY
        self.or_client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=self.or_key
        ) if self.or_key else None
        self.or_model = "google/gemini-2.5-flash"

        # Cerebras Client (Fast-Track)
        self.cerebras_key = os.getenv("CEREBRAS_API_KEY")
        self.cerebras_client = AsyncOpenAI(
            base_url="https://api.cerebras.ai/v1",
            api_key=self.cerebras_key
        ) if self.cerebras_key else None
        self.cerebras_model = "llama3.1-8b"

    async def _call_llm(self, prompt: str, response_schema: Type[T], preferred_provider: str = "ollama") -> T:
        if hasattr(response_schema, "model_json_schema"):
            schema_dict = response_schema.model_json_schema()
        else:
            schema_dict = response_schema.schema()
            
        system_message = (
            "You are a strict data extraction AI. You must return ONLY a valid raw JSON object "
            "that matches the provided schema perfectly. Do NOT wrap it in ```json blocks. "
            "Return just the raw JSON object, starting with { and ending with }.\n"
            f"Schema:\n{json.dumps(schema_dict, indent=2)}"
        )
        
        # Determine available providers
        available_providers = ["ollama"]
        if self.cerebras_client: available_providers.append("cerebras")
        if self.groq_client: available_providers.append("groq")
        if self.or_client: available_providers.append("openrouter")
        
        # Prioritize the preferred provider if available, otherwise fallback
        current_provider = preferred_provider if preferred_provider in available_providers else available_providers[0]
        max_retries = 10
        
        for attempt in range(max_retries):
            try:
                if current_provider == "ollama":
                    response = await self.ollama_client.chat.completions.create(
                        model=self.ollama_model,
                        messages=[
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={
                            "type": "json_schema",
                            "json_schema": {
                                "name": response_schema.__name__,
                                "schema": schema_dict,
                                "strict": True
                            }
                        },
                        temperature=0.2,
                    )
                    result_json = response.choices[0].message.content
                elif current_provider == "groq":
                    response = await self.groq_client.chat.completions.create(
                        model=self.groq_model,
                        messages=[
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.2,
                    )
                    result_json = response.choices[0].message.content
                elif current_provider == "cerebras":
                    response = await self.cerebras_client.chat.completions.create(
                        model=self.cerebras_model,
                        messages=[
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.2,
                    )
                    result_json = response.choices[0].message.content
                else:
                    # OpenRouter
                    response = await self.or_client.chat.completions.create(
                        model=self.or_model,
                        messages=[
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": prompt}
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.2,
                    )
                    result_json = response.choices[0].message.content
                
                # Clean up potential markdown formatting from local models
                result_json = result_json.strip()
                if result_json.startswith("```json"):
                    result_json = result_json[7:]
                elif result_json.startswith("```"):
                    result_json = result_json[3:]
                if result_json.endswith("```"):
                    result_json = result_json[:-3]
                result_json = result_json.strip()
                
                return response_schema.model_validate_json(result_json)
                
            except Exception as e:
                if attempt < max_retries - 1:
                    # Determine next fallback logic
                    if current_provider == "cerebras" and "ollama" in available_providers:
                        other_provider = "ollama"
                    elif current_provider == "ollama" and "groq" in available_providers:
                        other_provider = "groq"
                    elif current_provider == "groq" and "openrouter" in available_providers:
                        other_provider = "openrouter"
                    else:
                        other_provider = "ollama"
                    
                    # If we have a fallback and haven't tried it in this "round" yet, failover instantly
                    if other_provider in available_providers and attempt % len(available_providers) == 0:
                        logger.warning(f"Error on {current_provider} ({type(e).__name__}). Failing over to {other_provider} immediately...")
                        current_provider = other_provider
                        continue
                        
                    # Otherwise, providers failed (or we only have one). Do a jittered sleep and retry.
                    sleep_time = (4 * (attempt + 1)) + random.uniform(1.0, 3.0) 
                    logger.warning(f"Error on {current_provider}. Sleeping {sleep_time:.2f}s before retrying (Attempt {attempt+1}/{max_retries})...")
                    
                    # Reset back to preferred provider for the next round
                    current_provider = preferred_provider if preferred_provider in available_providers else available_providers[0]
                    await asyncio.sleep(sleep_time)
                    continue
                    
                logger.error(f"Error calling {current_provider} after {max_retries} attempts: {e}")
                if 'result_json' in locals():
                    logger.error(f"Failed JSON: {result_json}")
                raise
