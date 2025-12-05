"""High-level job orchestration for game asset generation."""

import hashlib
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from .client import MeshyClient
from .models import (
    ArtStyle,
    AssetIntent,
    GameAssetSpec,
    Text3DRequest,
)


@dataclass
class AssetManifest:
    """Metadata for generated asset."""

    asset_id: str
    intent: str
    description: str
    art_style: str
    model_path: str | None = None
    texture_paths: dict[str, str] | None = None
    thumbnail_path: str | None = None
    task_id: str = ""
    polycount_target: int | None = None
    polycount_estimate: int | None = None
    metadata: dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class AssetGenerator:
    """Orchestrates asset generation for game needs."""

    def __init__(self, client: MeshyClient | None = None, output_root: str = "client/public"):
        self.client = client or MeshyClient()
        self.output_root = Path(output_root)

    def _generate_asset_id(self, spec: GameAssetSpec) -> str:
        """Generate unique asset ID from spec."""
        if spec.asset_id:
            return spec.asset_id

        # Try to use metadata slug
        if spec.metadata and "slug" in spec.metadata:
            return spec.metadata["slug"]

        # Generate from description hash
        desc_hash = hashlib.sha256(spec.description.encode()).hexdigest()[:8]
        return f"{spec.intent.value}_{desc_hash}"

    def generate_model(
        self, spec: GameAssetSpec, wait: bool = True, poll_interval: float = 5.0
    ) -> AssetManifest:
        """Generate 3D model from spec."""
        # Generate unique asset ID
        asset_id = self._generate_asset_id(spec)

        # Build request
        request = Text3DRequest(
            mode="preview",  # Use "refine" for higher quality
            prompt=spec.description,
            art_style=spec.art_style,
            negative_prompt="low quality, blurry, distorted, extra limbs, bad topology",
            target_polycount=spec.target_polycount,
            enable_pbr=spec.enable_pbr,
        )

        # Create task
        task_id = self.client.create_text_to_3d(request)

        manifest = AssetManifest(
            asset_id=asset_id,
            intent=spec.intent.value,
            description=spec.description,
            art_style=spec.art_style.value,
            task_id=task_id,
            polycount_target=spec.target_polycount,
            metadata=spec.metadata.copy(),
        )

        if not wait:
            return manifest

        # Poll until complete
        result = self.client.poll_until_complete(
            task_id, task_type="text-to-3d", poll_interval=poll_interval
        )

        # Download assets
        output_dir = self.output_root / spec.output_path
        output_dir.mkdir(parents=True, exist_ok=True)

        if result.model_urls and result.model_urls.glb:
            glb_path = output_dir / f"{asset_id}.glb"
            self.client.download_file(result.model_urls.glb, str(glb_path))
            manifest.model_path = str(glb_path.relative_to(self.output_root))

        if result.texture_urls and len(result.texture_urls) > 0:
            textures = result.texture_urls[0]
            texture_paths = {}

            for map_type, url in textures.model_dump(exclude_none=True).items():
                if url:
                    tex_path = output_dir / f"{asset_id}_{map_type}.png"
                    self.client.download_file(url, str(tex_path))
                    texture_paths[map_type] = str(tex_path.relative_to(self.output_root))

            manifest.texture_paths = texture_paths

        if result.thumbnail_url:
            thumb_path = output_dir / f"{asset_id}_thumb.png"
            self.client.download_file(result.thumbnail_url, str(thumb_path))
            manifest.thumbnail_path = str(thumb_path.relative_to(self.output_root))

        # Save manifest
        manifest_path = output_dir / f"{asset_id}_manifest.json"
        with open(manifest_path, "w") as f:
            json.dump(manifest.to_dict(), f, indent=2)

        return manifest

    def retexture_model(
        self,
        model_path: str,
        texture_prompt: str,
        art_style: ArtStyle = ArtStyle.REALISTIC,
        wait: bool = True,
    ) -> AssetManifest:
        """Apply new texture to existing model."""
        # TODO: Need actual model URL (upload or use existing URL)
        # This is a placeholder - actual implementation needs model hosting
        msg = "Retexturing requires model URL. Upload model first or use existing URL."
        raise NotImplementedError(msg)

    def batch_generate(
        self, specs: list[GameAssetSpec], max_concurrent: int = 3
    ) -> list[AssetManifest]:
        """Generate multiple assets (respecting rate limits)."""
        manifests = []

        for spec in specs:
            try:
                manifest = self.generate_model(spec, wait=True)
                manifests.append(manifest)
            except Exception:  # noqa: S112
                # Batch generation continues even if one asset fails
                continue

        return manifests


# Preset specs for common game assets


def otter_player_spec() -> GameAssetSpec:
    return GameAssetSpec(
        intent=AssetIntent.PLAYER_CHARACTER,
        description=(
            "Anthropomorphic otter character standing upright, brown fur with white belly, "
            "expressive friendly face, wearing simple vest, game-ready low-poly model"
        ),
        art_style=ArtStyle.REALISTIC,
        target_polycount=15000,
        enable_pbr=True,
        output_path="models/characters",
    )


def otter_npc_male_spec() -> GameAssetSpec:
    return GameAssetSpec(
        intent=AssetIntent.NPC_CHARACTER,
        description=(
            "Male otter NPC wearing simple vest, friendly expression, brown fur, "
            "standing pose, game-ready low-poly"
        ),
        art_style=ArtStyle.REALISTIC,
        target_polycount=12000,
        enable_pbr=True,
        output_path="models/characters",
        metadata={"npc_type": "vendor"},
    )


def otter_npc_female_spec() -> GameAssetSpec:
    return GameAssetSpec(
        intent=AssetIntent.NPC_CHARACTER,
        description=(
            "Female otter NPC with lighter brown fur, wearing scarf, gentle expression, "
            "standing pose, game-ready low-poly"
        ),
        art_style=ArtStyle.REALISTIC,
        target_polycount=12000,
        enable_pbr=True,
        output_path="models/characters",
        metadata={"npc_type": "quest_giver"},
    )


def fish_bass_spec() -> GameAssetSpec:
    return GameAssetSpec(
        intent=AssetIntent.CREATURE_PREY,
        description="Freshwater bass fish, realistic scales, swimming pose, game-ready low-poly",
        art_style=ArtStyle.REALISTIC,
        target_polycount=5000,
        enable_pbr=True,
        output_path="models/creatures",
    )


def cattail_reeds_spec() -> GameAssetSpec:
    return GameAssetSpec(
        intent=AssetIntent.TERRAIN_ELEMENT,
        description=(
            "Marsh cattail plant cluster, green leaves and brown seed heads, "
            "swaying vegetation, game-ready low-poly"
        ),
        art_style=ArtStyle.REALISTIC,
        target_polycount=3000,
        enable_pbr=True,
        output_path="models/vegetation",
    )


def wooden_dock_spec() -> GameAssetSpec:
    return GameAssetSpec(
        intent=AssetIntent.PROP_INTERACTABLE,
        description=(
            "Simple wooden fishing dock extending over water, weathered wood planks, "
            "rustic construction, game-ready low-poly structure"
        ),
        art_style=ArtStyle.REALISTIC,
        target_polycount=8000,
        enable_pbr=True,
        output_path="models/structures",
    )
