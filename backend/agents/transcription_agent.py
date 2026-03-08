"""
Transcription Agent — Step 1
Uses faster-whisper (CTranslate2 backend) to transcribe audio.

Advantages over openai-whisper:
  - Pre-built wheels on Windows (no MSVC build tools required)
  - 4× faster inference on CPU
  - 50% lower memory footprint
  - Same accuracy as original Whisper

Model sizes: tiny | base | small | medium | large-v2 | large-v3
"""

import os
import time
from faster_whisper import WhisperModel
from backend.agents.base_agent import BaseAgent
from backend.state import ConsultationState


class TranscriptionAgent(BaseAgent):
    """Transcribes audio using faster-whisper ASR."""

    def __init__(self, model_size: str = "base"):
        super().__init__("TranscriptionAgent")
        self.model_size = model_size
        self._model: WhisperModel | None = None  # Lazy-load on first use

    @property
    def model(self) -> WhisperModel:
        if self._model is None:
            self.logger.info(f"Loading faster-whisper model: '{self.model_size}' on CPU")
            # device="cpu", compute_type="int8" → fastest, low-memory CPU run
            self._model = WhisperModel(
                self.model_size,
                device="cpu",
                compute_type="int8",
            )
            self.logger.info("faster-whisper model loaded.")
        return self._model

    def run(self, state: ConsultationState) -> ConsultationState:
        audio_path = state.get("audio_path", "")
        if not audio_path or not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        self.logger.info(f"Transcribing: {audio_path}")
        start = time.time()

        # faster-whisper returns a generator of Segment objects + audio info
        segments, info = self.model.transcribe(
            audio_path,
            beam_size=5,
            language=None,          # Auto-detect language
            condition_on_previous_text=False,  # Slightly faster, less hallucination
        )

        # Consume the segment generator and build full transcript
        transcript_parts = []
        last_end = 0.0
        for segment in segments:
            transcript_parts.append(segment.text.strip())
            last_end = segment.end

        transcript = " ".join(transcript_parts).strip()
        elapsed = time.time() - start
        duration = last_end or info.duration or 0.0

        self.logger.info(
            f"Transcription done in {elapsed:.1f}s | "
            f"Audio duration: {duration:.1f}s | "
            f"Language: {info.language} ({info.language_probability:.0%})"
        )

        return {
            "transcript": transcript,
            "audio_duration_seconds": round(duration, 2),
        }
