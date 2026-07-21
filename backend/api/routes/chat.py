from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import redis
import json
from backend.core.config import settings

router = APIRouter()
redis_client = redis.from_url(settings.REDIS_URL)

class ChatMessage(BaseModel):
    message: str
    report_id: str

class ChatResponse(BaseModel):
    reply: str
    citations: list[str] = []

@router.post("/", response_model=ChatResponse)
def chat_with_report(chat_message: ChatMessage):
    """
    RAG Chat endpoint. In production, this would use pgvector to retrieve
    relevant chunks of the report and send them to the LLM.
    """
    report_data = redis_client.get(f"report_data:{chat_message.report_id}")
    if not report_data:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report_json = json.loads(report_data)
    company_name = report_json.get("company", {}).get("name", "the company")
    
    # Use LLM (Gemini) to answer the question using the report as context
    prompt = f"""
    You are an expert business analyst and AI assistant for the Enterprise AI Sales Intelligence Platform.
    Use the following report data about {company_name} to answer the user's question.
    Only use the information provided in the report data. If the answer is not in the data, say you don't know.
    
    Report Data:
    {json.dumps(report_json, indent=2)}
    
    User Question: {chat_message.message}
    """
    
    try:
        from google import genai
        
        print(f"\n=======================================================")
        print(f"🤖 [GEMINI CHAT] Processing question: '{chat_message.message}'")
        print(f"=======================================================\n")
        
        if not settings.get_gemini_api_key:
            raise Exception("Gemini API key is not configured")
            
        client = genai.Client(api_key=settings.get_gemini_api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        print(f"\n=======================================================")
        print(f"✅ [GEMINI CHAT] Response generated!")
        print(f"=======================================================\n")
        
        reply = response.text
        # Since we are not doing a full vector search right now, citations are the whole report
        citations = ["Generated Report Data"]
        
    except Exception as e:
        reply = f"Sorry, I encountered an error communicating with the local AI: {str(e)}"
        citations = []
        
    return ChatResponse(reply=reply, citations=citations)
