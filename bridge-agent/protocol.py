"""JSON message protocol for the OpenSTAAD bridge agent."""

from __future__ import annotations

import json
import uuid
from typing import Any


def parse_request(raw: str) -> dict:
    """Parse an incoming JSON request. Raises ValueError on bad input."""
    try:
        msg = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON: {exc}") from exc

    if not isinstance(msg, dict):
        raise ValueError("Message must be a JSON object")
    if "id" not in msg or "method" not in msg:
        raise ValueError("Message must have 'id' and 'method' fields")

    return {
        "id": str(msg["id"]),
        "method": str(msg["method"]),
        "params": msg.get("params", {}),
    }


def make_response(request_id: str, result: Any) -> str:
    """Build a success response."""
    return json.dumps({"id": request_id, "result": result})


def make_error(request_id: str, code: int, message: str) -> str:
    """Build an error response."""
    return json.dumps({"id": request_id, "error": {"code": code, "message": message}})


def make_event(event_name: str, data: Any) -> str:
    """Build an unsolicited event message."""
    return json.dumps({"event": event_name, "data": data})


def new_id() -> str:
    """Generate a correlation ID."""
    return str(uuid.uuid4())
