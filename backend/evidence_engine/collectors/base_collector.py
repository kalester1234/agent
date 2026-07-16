import abc
import asyncio
from typing import List, Dict, Any

class BaseCollector(abc.ABC):
    """Abstract base class for all evidence collectors.

    Each collector implements an async ``collect`` method that returns a list of
    evidence dictionaries. The exact schema of an evidence item is defined in
    ``backend/evidence_engine/storage/models.py``.
    """

    def __init__(self, company_name: str, domain: str):
        self.company_name = company_name
        self.domain = domain

    @abc.abstractmethod
    async def collect(self) -> List[Dict[str, Any]]:
        """Collect evidence for the configured company.

        Returns
        -------
        List[Dict[str, Any]]
            A list of raw evidence dictionaries. Validation and persistence are
            handled by the pipeline after collection.
        """
        raise NotImplementedError
