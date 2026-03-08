"""
Gemini API client wrapper.
Uses the new google-genai SDK (replaces deprecated google-generativeai).
Model: gemini-1.5-flash — best price/performance for structured extraction.
"""

import os
from google import genai
from google.genai import types

def _get_api_key():
    return os.getenv("GEMINI_API_KEY", "")

def _get_model_name():
    return os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# Conservative generation config — minimize hallucination, cap tokens
_GENERATION_CONFIG = types.GenerateContentConfig(
    temperature=0.1,        # Near-deterministic — critical for medical outputs
    top_p=0.8,
    max_output_tokens=1024, # Hard cap to avoid expensive runaway generation
    safety_settings=[
        types.SafetySetting(
            category="HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold="BLOCK_NONE",
        ),
        types.SafetySetting(
            category="HARM_CATEGORY_HARASSMENT",
            threshold="BLOCK_NONE",
        ),
    ],
)


def get_gemini_response(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the response text.
    Raises RuntimeError if GEMINI_API_KEY is not set.
    """
    api_key = _get_api_key()
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. "
            "Copy .env.example → .env and add your key from https://aistudio.google.com/app/apikey"
        )

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=_get_model_name(),
        contents=prompt,
        config=_GENERATION_CONFIG,
    )

    return response.text or ""
