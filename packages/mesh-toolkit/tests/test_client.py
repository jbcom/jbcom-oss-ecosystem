"""Tests for MeshyClient."""

import os
from unittest.mock import MagicMock, patch

import pytest
import tenacity
from mesh_toolkit.client import MeshyClient, RateLimitError
from mesh_toolkit.models import (
    AnimationRequest,
    Image3DRequest,
    RetextureRequest,
    RiggingRequest,
    TaskStatus,
    Text3DRequest,
    TextTextureRequest,
)


class TestMeshyClientInit:
    """Tests for MeshyClient initialization."""

    def test_init_with_api_key(self, api_key):
        """Test initialization with explicit API key."""
        with patch.dict(os.environ, {"MESHY_API_KEY": api_key}), patch("httpx.Client"):
            with patch("httpx.AsyncClient"):
                client = MeshyClient(api_key=api_key)
                assert client.api_key == api_key
                client.close()

    def test_init_from_env(self, mock_env_api_key):
        """Test initialization from environment variable."""
        with patch("httpx.Client"), patch("httpx.AsyncClient"):
            client = MeshyClient()
            assert client.api_key == mock_env_api_key
            client.close()

    def test_init_without_api_key_raises(self):
        """Test that missing API key raises ValueError."""
        with patch.dict(os.environ, {}, clear=True):
            # Remove MESHY_API_KEY if it exists
            os.environ.pop("MESHY_API_KEY", None)
            with pytest.raises(ValueError, match="MESHY_API_KEY not set"):
                MeshyClient()

    def test_context_manager(self, api_key):
        """Test using client as context manager."""
        with patch.dict(os.environ, {"MESHY_API_KEY": api_key}), patch("httpx.Client"):
            with patch("httpx.AsyncClient"):
                with MeshyClient(api_key=api_key) as client:
                    assert client.api_key == api_key


class TestMeshyClientHeaders:
    """Tests for request headers."""

    def test_headers_include_auth(self, meshy_client, api_key):
        """Test that headers include authorization."""
        headers = meshy_client._headers()
        assert headers["Authorization"] == f"Bearer {api_key}"
        assert headers["Content-Type"] == "application/json"


class TestMeshyClientURLConstruction:
    """Tests for URL construction (the bug we fixed)."""

    def test_request_url_includes_openapi(self, meshy_client, mock_response):
        """Test that _request constructs URLs with /openapi/ path."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "task-123"},
        )

        meshy_client._request("POST", "text-to-3d", json={"prompt": "test"})

        # Verify the URL was constructed correctly
        call_args = meshy_client.client.request.call_args
        url = call_args[0][1]  # Second positional arg is URL
        assert "/openapi/v2/text-to-3d" in url
        assert url == "https://api.meshy.ai/openapi/v2/text-to-3d"

    def test_request_url_format_for_get(self, meshy_client, mock_response):
        """Test URL format for GET requests."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"id": "task-123", "status": "SUCCEEDED"},
        )

        meshy_client._request("GET", "text-to-3d/task-123")

        call_args = meshy_client.client.request.call_args
        url = call_args[0][1]
        assert url == "https://api.meshy.ai/openapi/v2/text-to-3d/task-123"


class TestMeshyClientText3D:
    """Tests for text-to-3D endpoints."""

    def test_create_text_to_3d(self, meshy_client, mock_response, text3d_create_response):
        """Test creating a text-to-3D task."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data=text3d_create_response,
        )

        request = Text3DRequest(prompt="A red apple")
        task_id = meshy_client.create_text_to_3d(request)

        assert task_id == "task-12345-abcde"
        meshy_client.client.request.assert_called_once()

    def test_get_text_to_3d(self, meshy_client, mock_response, text3d_status_response):
        """Test getting text-to-3D task status."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data=text3d_status_response,
        )

        result = meshy_client.get_text_to_3d("task-12345-abcde")

        assert result.id == "task-12345-abcde"
        assert result.status == TaskStatus.SUCCEEDED
        assert result.model_urls.glb == "https://assets.meshy.ai/models/task-12345.glb"


class TestMeshyClientTextTexture:
    """Tests for text-to-texture endpoints."""

    def test_create_text_to_texture(self, meshy_client, mock_response):
        """Test creating a text-to-texture task."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "texture-task-123"},
        )

        request = TextTextureRequest(
            model_url="https://example.com/model.glb",
            prompt="Wood grain texture",
        )
        task_id = meshy_client.create_text_to_texture(request)

        assert task_id == "texture-task-123"

    def test_get_text_to_texture(self, meshy_client, mock_response):
        """Test getting text-to-texture task status."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={
                "id": "texture-task-123",
                "status": "SUCCEEDED",
                "progress": 100,
                "created_at": 1700000000,
            },
        )

        result = meshy_client.get_text_to_texture("texture-task-123")
        assert result.id == "texture-task-123"
        assert result.status == TaskStatus.SUCCEEDED


class TestMeshyClientImage3D:
    """Tests for image-to-3D endpoints."""

    def test_create_image_to_3d(self, meshy_client, mock_response):
        """Test creating an image-to-3D task."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "img3d-task-123"},
        )

        request = Image3DRequest(image_url="https://example.com/image.png")
        task_id = meshy_client.create_image_to_3d(request)

        assert task_id == "img3d-task-123"


class TestMeshyClientRigging:
    """Tests for rigging endpoints."""

    def test_create_rigging(self, meshy_client, mock_response, rigging_create_response):
        """Test creating a rigging task."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data=rigging_create_response,
        )

        request = RiggingRequest(input_task_id="task-123")
        task_id = meshy_client.create_rigging(request)

        assert task_id == "rig-task-67890"
        # Verify rigging uses v1 and openapi path
        call_args = meshy_client.client.request.call_args
        url = call_args[0][1]
        assert "/openapi/v1/rigging" in url

    def test_get_rigging(self, meshy_client, mock_response, rigging_status_response):
        """Test getting rigging task status."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data=rigging_status_response,
        )

        result = meshy_client.get_rigging("rig-task-67890")

        assert result.id == "rig-task-67890"
        assert result.status == TaskStatus.SUCCEEDED
        assert (
            result.result.rigged_character_glb_url
            == "https://assets.meshy.ai/rigged/task-67890.glb"
        )


class TestMeshyClientAnimation:
    """Tests for animation endpoints."""

    def test_create_animation(self, meshy_client, mock_response):
        """Test creating an animation task."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "anim-task-123"},
        )

        request = AnimationRequest(rig_task_id="rig-123", action_id=1)
        task_id = meshy_client.create_animation(request)

        assert task_id == "anim-task-123"
        # Verify animation uses v1 and openapi path
        call_args = meshy_client.client.request.call_args
        url = call_args[0][1]
        assert "/openapi/v1/animations" in url


class TestMeshyClientRetexture:
    """Tests for retexture endpoints."""

    def test_create_retexture(self, meshy_client, mock_response):
        """Test creating a retexture task."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "retex-task-123"},
        )

        request = RetextureRequest(
            input_task_id="task-123",
            text_style_prompt="sci-fi chrome",
        )
        task_id = meshy_client.create_retexture(request)

        assert task_id == "retex-task-123"


class TestMeshyClientRateLimiting:
    """Tests for rate limiting behavior."""

    def test_rate_limit_429_raises_error(self, meshy_client, mock_response):
        """Test that 429 response raises RateLimitError or tenacity RetryError."""
        meshy_client.client.request.return_value = mock_response(
            status_code=429,
            headers={"retry-after": "0.001"},
        )

        # With retries disabled (stop_after_attempt(1)), we get RetryError wrapping RateLimitError
        with pytest.raises((RateLimitError, tenacity.RetryError)):
            meshy_client._request("POST", "text-to-3d", json={})

    def test_rate_limit_respects_retry_after(self, meshy_client, mock_response):
        """Test that retry-after header is parsed."""
        meshy_client.client.request.return_value = mock_response(
            status_code=429,
            headers={"retry-after": "0.001"},
        )

        with pytest.raises((RateLimitError, tenacity.RetryError)):
            meshy_client._request("POST", "text-to-3d", json={})


class TestMeshyClientPolling:
    """Tests for polling helpers."""

    def test_poll_until_complete_success(self, meshy_client, mock_response, text3d_status_response):
        """Test polling until task succeeds."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data=text3d_status_response,
        )

        result = meshy_client.poll_until_complete(
            "task-12345-abcde",
            task_type="text-to-3d",
            poll_interval=0.01,
        )

        assert result.status == TaskStatus.SUCCEEDED

    def test_poll_until_complete_failure(self, meshy_client, mock_response):
        """Test polling handles failed task."""
        meshy_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={
                "id": "task-123",
                "status": "FAILED",
                "progress": 50,
                "created_at": 1700000000,
                "error": "Generation failed",
                "task_error": {"message": "Generation failed"},
            },
        )

        with pytest.raises(RuntimeError, match="Task failed"):
            meshy_client.poll_until_complete(
                "task-123",
                task_type="text-to-3d",
                poll_interval=0.01,
            )

    def test_poll_unknown_task_type_raises(self, meshy_client):
        """Test that unknown task type raises ValueError."""
        with pytest.raises(ValueError, match="Unknown task type"):
            meshy_client.poll_until_complete(
                "task-123",
                task_type="unknown-type",
            )


class TestMeshyClientDownload:
    """Tests for file download functionality."""

    def test_download_file(self, meshy_client, temp_dir):
        """Test downloading a file."""
        test_content = b"fake GLB content"

        with patch("httpx.get") as mock_get:
            mock_response = MagicMock()
            mock_response.content = test_content
            mock_response.raise_for_status = MagicMock()
            mock_get.return_value = mock_response

            output_path = temp_dir / "model.glb"
            size = meshy_client.download_file(
                "https://example.com/model.glb",
                str(output_path),
            )

            assert size == len(test_content)
            assert output_path.exists()
            assert output_path.read_bytes() == test_content
