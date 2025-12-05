"""Pydantic schemas for manifest JSON structure."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    """Task status enum."""

    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"


class TaskSubmission(BaseModel):
    """Record of a task submission."""

    task_id: str
    spec_hash: str
    species: str
    service: str
    status: TaskStatus
    callback_url: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskGraphEntry(BaseModel):
    """Record of a single task in the generation pipeline."""

    task_id: str
    service: str  # "text3d", "rigging", "animation", "retexture"
    status: str  # TaskStatus enum value as string
    created_at: datetime
    updated_at: datetime
    payload: dict[str, Any] = Field(default_factory=dict)  # Request params
    result_paths: dict[str, str] = Field(default_factory=dict)  # URLs/paths from API
    error: str | None = None


class ArtifactRecord(BaseModel):
    """Record of a downloaded file artifact."""

    relative_path: str  # Relative to species directory
    sha256_hash: str
    file_size_bytes: int
    downloaded_at: datetime
    source_url: str | None = None


class StatusHistoryEntry(BaseModel):
    """Record of a status transition."""

    timestamp: datetime
    old_status: str
    new_status: str
    source: str  # "orchestrator", "webhook", "manual"
    task_id: str | None = None


class AssetManifest(BaseModel):
    """Manifest for a single generated asset."""

    asset_spec_hash: str
    spec_fingerprint: str  # Canonicalized JSON of input spec
    species: str
    asset_intent: str  # "creature", "prop", "environment"
    prompts: dict[str, str] = Field(default_factory=dict)  # service -> prompt mapping
    task_graph: list[TaskGraphEntry] = Field(default_factory=list)
    artifacts: list[ArtifactRecord] = Field(default_factory=list)
    history: list[StatusHistoryEntry] = Field(default_factory=list)
    resume_tokens: dict[str, Any] = Field(default_factory=dict)  # For pipeline continuation
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SpeciesManifest(BaseModel):
    """Top-level manifest for all assets of a species."""

    species: str
    asset_specs: dict[str, AssetManifest] = Field(default_factory=dict)  # hash -> manifest
    version: str = "1.0"
    last_updated: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
