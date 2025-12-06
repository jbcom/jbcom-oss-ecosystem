"""Persistence layer for task manifests and resume capability.

Two storage backends are available:
1. JSON manifests (TaskRepository) - Simple file-based storage
2. SQLite vector store (VectorStore) - For idempotency + RAG embeddings

Usage:
    # Simple JSON manifests
    from mesh_toolkit.persistence import TaskRepository
    repo = TaskRepository("models/")
    
    # Vector-enabled SQLite for RAG
    from mesh_toolkit.persistence import VectorStore
    store = VectorStore("assets.db")
    store.record_generation(spec_hash, prompt, embedding=get_embedding(prompt))
    similar = store.search_similar(query_embedding)
"""

from .repository import TaskRepository
from .schemas import ArtifactRecord, AssetManifest, ProjectManifest, TaskGraphEntry
from .utils import canonicalize_spec, compute_spec_hash
from .vector_store import VectorStore, GenerationRecord, SimilarityResult, get_embedding

__all__ = [
    # JSON manifests
    "ArtifactRecord",
    "AssetManifest",
    "ProjectManifest",
    "TaskGraphEntry",
    "TaskRepository",
    "canonicalize_spec",
    "compute_spec_hash",
    # Vector store
    "VectorStore",
    "GenerationRecord",
    "SimilarityResult",
    "get_embedding",
]
