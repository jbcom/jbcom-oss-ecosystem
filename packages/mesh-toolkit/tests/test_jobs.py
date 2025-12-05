"""Tests for job orchestration (AssetGenerator)."""

import json
from unittest.mock import MagicMock, patch

import pytest

from mesh_toolkit.jobs import (
    AssetGenerator,
    AssetManifest,
    cattail_reeds_spec,
    fish_bass_spec,
    otter_npc_female_spec,
    otter_npc_male_spec,
    otter_player_spec,
    wooden_dock_spec,
)
from mesh_toolkit.models import (
    ArtStyle,
    AssetIntent,
    GameAssetSpec,
    ModelUrls,
    TaskStatus,
    Text3DResult,
    TextureUrls,
)


class TestAssetManifest:
    """Tests for AssetManifest dataclass."""

    def test_create_manifest(self):
        """Test creating an asset manifest."""
        manifest = AssetManifest(
            asset_id="otter-001",
            intent="player_character",
            description="An otter character",
            art_style="realistic",
            task_id="task-123",
        )
        assert manifest.asset_id == "otter-001"
        assert manifest.intent == "player_character"
        assert manifest.task_id == "task-123"

    def test_manifest_to_dict(self):
        """Test converting manifest to dictionary."""
        manifest = AssetManifest(
            asset_id="test-001",
            intent="prop",
            description="A test prop",
            art_style="cartoon",
            model_path="models/test.glb",
        )
        data = manifest.to_dict()
        assert data["asset_id"] == "test-001"
        assert data["model_path"] == "models/test.glb"

    def test_manifest_default_metadata(self):
        """Test that metadata defaults to empty dict."""
        manifest = AssetManifest(
            asset_id="test",
            intent="prop",
            description="Test",
            art_style="realistic",
        )
        assert manifest.metadata == {}


class TestAssetGenerator:
    """Tests for AssetGenerator."""

    def test_generate_asset_id_from_spec(self, api_key):
        """Test asset ID generation from spec."""
        with patch("mesh_toolkit.jobs.MeshyClient"):
            generator = AssetGenerator()

            spec = GameAssetSpec(
                intent=AssetIntent.PLAYER_CHARACTER,
                description="Test character",
                output_path="models/test",
                asset_id="custom-id-123",
            )

            asset_id = generator._generate_asset_id(spec)
            assert asset_id == "custom-id-123"

    def test_generate_asset_id_from_slug(self, api_key):
        """Test asset ID generation from metadata slug."""
        with patch("mesh_toolkit.jobs.MeshyClient"):
            generator = AssetGenerator()

            spec = GameAssetSpec(
                intent=AssetIntent.NPC_CHARACTER,
                description="Test NPC",
                output_path="models/test",
                metadata={"slug": "npc-vendor"},
            )

            asset_id = generator._generate_asset_id(spec)
            assert asset_id == "npc-vendor"

    def test_generate_asset_id_from_hash(self, api_key):
        """Test asset ID generation from description hash."""
        with patch("mesh_toolkit.jobs.MeshyClient"):
            generator = AssetGenerator()

            spec = GameAssetSpec(
                intent=AssetIntent.PROP_DECORATION,
                description="A unique barrel",
                output_path="models/props",
            )

            asset_id = generator._generate_asset_id(spec)
            assert asset_id.startswith("prop_decoration_")
            assert len(asset_id) > len("prop_decoration_")

    def test_generate_model_no_wait(self, api_key, temp_dir):
        """Test generating model without waiting."""
        mock_client = MagicMock()
        mock_client.create_text_to_3d.return_value = "task-12345"

        generator = AssetGenerator(client=mock_client, output_root=str(temp_dir))

        spec = GameAssetSpec(
            intent=AssetIntent.PLAYER_CHARACTER,
            description="An otter character",
            output_path="models/characters",
            asset_id="otter-001",
        )

        manifest = generator.generate_model(spec, wait=False)

        assert manifest.asset_id == "otter-001"
        assert manifest.task_id == "task-12345"
        assert manifest.model_path is None  # Not downloaded yet
        mock_client.create_text_to_3d.assert_called_once()

    def test_generate_model_with_wait(self, api_key, temp_dir):
        """Test generating model with polling."""
        mock_client = MagicMock()
        mock_client.create_text_to_3d.return_value = "task-12345"
        mock_client.poll_until_complete.return_value = Text3DResult(
            id="task-12345",
            status=TaskStatus.SUCCEEDED,
            progress=100,
            created_at=1700000000,
            model_urls=ModelUrls(glb="https://example.com/model.glb"),
            texture_urls=[TextureUrls(base_color="https://example.com/base.png")],
            thumbnail_url="https://example.com/thumb.png",
        )
        mock_client.download_file.return_value = 1000

        generator = AssetGenerator(client=mock_client, output_root=str(temp_dir))

        spec = GameAssetSpec(
            intent=AssetIntent.PLAYER_CHARACTER,
            description="An otter character",
            output_path="models/characters",
            asset_id="otter-001",
        )

        manifest = generator.generate_model(spec, wait=True, poll_interval=0.01)

        assert manifest.asset_id == "otter-001"
        assert manifest.model_path is not None
        assert "otter-001.glb" in manifest.model_path
        mock_client.download_file.assert_called()

    def test_generate_model_saves_manifest_json(self, api_key, temp_dir):
        """Test that manifest JSON is saved."""
        mock_client = MagicMock()
        mock_client.create_text_to_3d.return_value = "task-12345"
        mock_client.poll_until_complete.return_value = Text3DResult(
            id="task-12345",
            status=TaskStatus.SUCCEEDED,
            progress=100,
            created_at=1700000000,
            model_urls=ModelUrls(glb="https://example.com/model.glb"),
        )
        mock_client.download_file.return_value = 1000

        generator = AssetGenerator(client=mock_client, output_root=str(temp_dir))

        spec = GameAssetSpec(
            intent=AssetIntent.PROP_DECORATION,
            description="A barrel",
            output_path="models/props",
            asset_id="barrel-001",
        )

        generator.generate_model(spec, wait=True, poll_interval=0.01)

        manifest_path = temp_dir / "models" / "props" / "barrel-001_manifest.json"
        assert manifest_path.exists()

        with open(manifest_path) as f:
            saved_manifest = json.load(f)
        assert saved_manifest["asset_id"] == "barrel-001"

    def test_batch_generate(self, api_key, temp_dir):
        """Test batch generation of multiple assets."""
        mock_client = MagicMock()
        mock_client.create_text_to_3d.return_value = "task-12345"
        mock_client.poll_until_complete.return_value = Text3DResult(
            id="task-12345",
            status=TaskStatus.SUCCEEDED,
            progress=100,
            created_at=1700000000,
            model_urls=ModelUrls(glb="https://example.com/model.glb"),
        )
        mock_client.download_file.return_value = 1000

        generator = AssetGenerator(client=mock_client, output_root=str(temp_dir))

        specs = [
            GameAssetSpec(
                intent=AssetIntent.PROP_DECORATION,
                description="Item 1",
                output_path="models/props",
                asset_id="item-001",
            ),
            GameAssetSpec(
                intent=AssetIntent.PROP_DECORATION,
                description="Item 2",
                output_path="models/props",
                asset_id="item-002",
            ),
        ]

        manifests = generator.batch_generate(specs)

        assert len(manifests) == 2
        assert manifests[0].asset_id == "item-001"
        assert manifests[1].asset_id == "item-002"

    def test_batch_generate_continues_on_failure(self, api_key, temp_dir):
        """Test that batch generation continues if one fails."""
        mock_client = MagicMock()

        call_count = [0]

        def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] == 1:
                raise RuntimeError("First task failed")
            return "task-success"

        mock_client.create_text_to_3d.side_effect = side_effect
        mock_client.poll_until_complete.return_value = Text3DResult(
            id="task-success",
            status=TaskStatus.SUCCEEDED,
            progress=100,
            created_at=1700000000,
            model_urls=ModelUrls(glb="https://example.com/model.glb"),
        )
        mock_client.download_file.return_value = 1000

        generator = AssetGenerator(client=mock_client, output_root=str(temp_dir))

        specs = [
            GameAssetSpec(
                intent=AssetIntent.PROP_DECORATION,
                description="Will fail",
                output_path="models/props",
                asset_id="fail-001",
            ),
            GameAssetSpec(
                intent=AssetIntent.PROP_DECORATION,
                description="Will succeed",
                output_path="models/props",
                asset_id="success-001",
            ),
        ]

        manifests = generator.batch_generate(specs)

        # Only the successful one should be in results
        assert len(manifests) == 1
        assert manifests[0].asset_id == "success-001"

    def test_retexture_not_implemented(self, api_key, temp_dir):
        """Test that retexture raises NotImplementedError."""
        with patch("mesh_toolkit.jobs.MeshyClient"):
            generator = AssetGenerator(output_root=str(temp_dir))

            with pytest.raises(NotImplementedError):
                generator.retexture_model(
                    model_path="models/test.glb",
                    texture_prompt="New texture",
                )


class TestPresetSpecs:
    """Tests for preset game asset specs."""

    def test_otter_player_spec(self):
        """Test otter player preset."""
        spec = otter_player_spec()
        assert spec.intent == AssetIntent.PLAYER_CHARACTER
        assert spec.art_style == ArtStyle.REALISTIC
        assert spec.target_polycount == 15000
        assert "otter" in spec.description.lower()

    def test_otter_npc_male_spec(self):
        """Test male otter NPC preset."""
        spec = otter_npc_male_spec()
        assert spec.intent == AssetIntent.NPC_CHARACTER
        assert spec.metadata.get("npc_type") == "vendor"

    def test_otter_npc_female_spec(self):
        """Test female otter NPC preset."""
        spec = otter_npc_female_spec()
        assert spec.intent == AssetIntent.NPC_CHARACTER
        assert spec.metadata.get("npc_type") == "quest_giver"

    def test_fish_bass_spec(self):
        """Test fish bass preset."""
        spec = fish_bass_spec()
        assert spec.intent == AssetIntent.CREATURE_PREY
        assert spec.target_polycount == 5000

    def test_cattail_reeds_spec(self):
        """Test cattail reeds preset."""
        spec = cattail_reeds_spec()
        assert spec.intent == AssetIntent.TERRAIN_ELEMENT
        assert spec.target_polycount == 3000

    def test_wooden_dock_spec(self):
        """Test wooden dock preset."""
        spec = wooden_dock_spec()
        assert spec.intent == AssetIntent.PROP_INTERACTABLE
        assert spec.target_polycount == 8000
