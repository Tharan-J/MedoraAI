"""
Base agent class for all clinical agents.
Provides common interface, logging, and error handling.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any

from backend.state import ConsultationState

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Abstract base class for all agents in the clinical workflow."""

    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"agent.{name}")

    @abstractmethod
    def run(self, state: ConsultationState) -> ConsultationState:
        """Execute the agent and update the state."""
        pass

    def __call__(self, state: ConsultationState) -> ConsultationState:
        self.logger.info(f"[{self.name}] Starting...")
        try:
            updated = self.run(state)
            self.logger.info(f"[{self.name}] Completed successfully.")
            return updated
        except Exception as e:
            self.logger.error(f"[{self.name}] Failed: {e}", exc_info=True)
            raise
