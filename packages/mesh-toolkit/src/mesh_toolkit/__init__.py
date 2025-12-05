"""Meshy SDK for game asset generation."""

from .client import MeshyClient, RateLimitError
from .jobs import (
    AssetGenerator,
    AssetManifest,
    cattail_reeds_spec,
    fish_bass_spec,
    otter_npc_female_spec,
    otter_npc_male_spec,
    otter_player_spec,
    wooden_dock_spec,
)
from .models import (
    ArtStyle,
    AssetIntent,
    GameAssetSpec,
    Image3DRequest,
    TaskStatus,
    Text3DRequest,
    TextTextureRequest,
)

__all__ = [
    "ArtStyle",
    "AssetGenerator",
    "AssetIntent",
    "AssetManifest",
    "GameAssetSpec",
    "Image3DRequest",
    "MeshyClient",
    "RateLimitError",
    "TaskStatus",
    "Text3DRequest",
    "TextTextureRequest",
    "cattail_reeds_spec",
    "fish_bass_spec",
    "otter_npc_female_spec",
    "otter_npc_male_spec",
    "otter_player_spec",
    "wooden_dock_spec",
]
