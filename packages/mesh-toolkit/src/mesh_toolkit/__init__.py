"""Meshy SDK for game asset generation"""

from .client import MeshyClient, RateLimitError
from .models import (
    TaskStatus,
    ArtStyle,
    AssetIntent,
    GameAssetSpec,
    Text3DRequest,
    TextTextureRequest,
    Image3DRequest
)
from .jobs import (
    AssetGenerator,
    AssetManifest,
    otter_player_spec,
    otter_npc_male_spec,
    otter_npc_female_spec,
    fish_bass_spec,
    cattail_reeds_spec,
    wooden_dock_spec
)

__all__ = [
    "MeshyClient",
    "RateLimitError",
    "TaskStatus",
    "ArtStyle",
    "AssetIntent",
    "GameAssetSpec",
    "Text3DRequest",
    "TextTextureRequest",
    "Image3DRequest",
    "AssetGenerator",
    "AssetManifest",
    "otter_player_spec",
    "otter_npc_male_spec",
    "otter_npc_female_spec",
    "fish_bass_spec",
    "cattail_reeds_spec",
    "wooden_dock_spec",
]
