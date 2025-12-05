# mesh-toolkit

Python SDK for [Meshy AI](https://www.meshy.ai/) 3D asset generation API.

Generate game-ready 3D models, textures, and animations from text prompts.

## Installation

```bash
pip install mesh-toolkit
```

Or with uv:
```bash
uv add mesh-toolkit
```

## Features

- **All Endpoints**: Text-to-3D, Text-to-Texture, Image-to-3D
- **Rate Limiting**: Automatic 429 handling with exponential backoff
- **Type Safety**: Pydantic models for all API types
- **Job Orchestration**: High-level `AssetGenerator` for game asset workflows
- **Auto-Download**: Fetches GLB models, PBR textures, thumbnails
- **Metadata**: JSON manifests for ECS integration

## Quick Start

```python
from mesh_toolkit import MeshyClient, Text3DRequest, ArtStyle

# Initialize client (uses MESHY_API_KEY env var)
client = MeshyClient()

# Create a 3D model from text
task_id = client.create_text_to_3d(Text3DRequest(
    prompt="anthropomorphic otter character, realistic fur, standing pose",
    art_style=ArtStyle.REALISTIC,
    target_polycount=15000,
    enable_pbr=True
))

# Poll until complete
result = client.poll_until_complete(task_id, task_type="text-to-3d")

# Download the model
client.download_file(result.model_urls.glb, "otter.glb")
```

## Asset Generator (High-Level API)

For game development workflows:

```python
from mesh_toolkit import AssetGenerator, GameAssetSpec, AssetIntent, ArtStyle

spec = GameAssetSpec(
    intent=AssetIntent.CREATURE_PLAYER,
    description="cute river otter, anthropomorphic, game character",
    art_style=ArtStyle.REALISTIC,
    target_polycount=15000,
    output_path="assets/player"
)

generator = AssetGenerator(output_root="./models")
manifest = generator.generate_model(spec, wait=True)

print(f"Model: {manifest.model_path}")
print(f"Textures: {manifest.texture_paths}")
```

## Services

### Text-to-3D Service
```python
from mesh_toolkit.services import Text3DService

service = Text3DService()
result = await service.generate("a medieval sword", art_style="realistic")
```

### Rigging Service
```python
from mesh_toolkit.services import RiggingService

service = RiggingService()
result = await service.rig_model(task_id="...")
```

### Animation Service
```python
from mesh_toolkit.services import AnimationService

service = AnimationService()
result = await service.animate(
    task_id="...", 
    animation_type="walk_cycle"
)
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MESHY_API_KEY` | Your Meshy API key (required) |

## Requirements

- Python 3.11+
- `httpx` - Async HTTP client
- `tenacity` - Retry logic
- `pydantic` - Type validation
- `rich` - Pretty output

## License

MIT
