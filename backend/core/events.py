import asyncio
from typing import AsyncGenerator, Dict, Any
import json

class EventManager:
    def __init__(self):
        # Maps job_id to a queue of events
        self.subscribers: Dict[str, asyncio.Queue] = {}

    def subscribe(self, job_id: str) -> asyncio.Queue:
        if job_id not in self.subscribers:
            self.subscribers[job_id] = asyncio.Queue()
        return self.subscribers[job_id]

    async def emit(self, job_id: str, event_type: str, data: Any):
        if job_id in self.subscribers:
            event = {
                "event": event_type,
                "data": data
            }
            await self.subscribers[job_id].put(event)

    def unsubscribe(self, job_id: str):
        if job_id in self.subscribers:
            del self.subscribers[job_id]

event_manager = EventManager()
