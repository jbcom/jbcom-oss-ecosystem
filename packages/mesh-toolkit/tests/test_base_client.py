"""Tests for BaseHttpClient."""

import os
from unittest.mock import MagicMock, patch

import httpx
import pytest

from mesh_toolkit.api.base_client import BaseHttpClient, RateLimitError


class TestBaseHttpClientInit:
    """Tests for BaseHttpClient initialization."""

    def test_init_with_api_key(self):
        """Test initialization with explicit API key."""
        client = BaseHttpClient(api_key="test-key")
        assert client.api_key == "test-key"
        client.close()

    def test_init_from_env(self, mock_env_api_key):
        """Test initialization from environment variable."""
        client = BaseHttpClient()
        assert client.api_key == mock_env_api_key
        client.close()

    def test_init_without_api_key_raises(self):
        """Test that missing API key raises ValueError."""
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("MESHY_API_KEY", None)
            with pytest.raises(ValueError, match="MESHY_API_KEY not set"):
                BaseHttpClient()

    def test_custom_timeout(self):
        """Test custom timeout setting."""
        with patch.dict(os.environ, {"MESHY_API_KEY": "test"}):
            client = BaseHttpClient(timeout=60.0)
            assert client.timeout == 60.0
            client.close()


class TestBaseHttpClientURLConstruction:
    """Tests for URL construction."""

    def test_request_url_includes_openapi(self, base_http_client, mock_response):
        """Test that request constructs URLs with /openapi/ path."""
        base_http_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "task-123"},
        )

        base_http_client.request("POST", "text-to-3d", api_version="v2", json={})

        call_args = base_http_client.client.request.call_args
        url = call_args[0][1]
        assert url == "https://api.meshy.ai/openapi/v2/text-to-3d"

    def test_request_url_with_v1(self, base_http_client, mock_response):
        """Test URL construction with v1 API version."""
        base_http_client.client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "task-123"},
        )

        base_http_client.request("POST", "rigging", api_version="v1", json={})

        call_args = base_http_client.client.request.call_args
        url = call_args[0][1]
        assert url == "https://api.meshy.ai/openapi/v1/rigging"


class TestBaseHttpClientRateLimiting:
    """Tests for rate limiting behavior."""

    def test_429_raises_rate_limit_error(self, base_http_client, mock_response):
        """Test that 429 response raises RateLimitError."""
        base_http_client.client.request.return_value = mock_response(
            status_code=429,
            headers={"retry-after": "5"},
        )

        with pytest.raises(RateLimitError):
            base_http_client.request("POST", "text-to-3d", json={})

    def test_5xx_raises_for_retry(self, base_http_client, mock_response):
        """Test that 5xx errors raise for retry."""
        base_http_client.client.request.return_value = mock_response(
            status_code=500,
        )

        with pytest.raises(RateLimitError, match="Server error"):
            base_http_client.request("GET", "text-to-3d/task-123")


class TestBaseHttpClientDownload:
    """Tests for file download functionality."""

    def test_download_file_streaming(self, base_http_client, temp_dir):
        """Test streaming file download."""
        test_chunks = [b"chunk1", b"chunk2", b"chunk3"]

        mock_stream_response = MagicMock()
        mock_stream_response.__enter__ = MagicMock(return_value=mock_stream_response)
        mock_stream_response.__exit__ = MagicMock(return_value=False)
        mock_stream_response.raise_for_status = MagicMock()
        mock_stream_response.iter_bytes = MagicMock(return_value=iter(test_chunks))

        base_http_client.client.stream = MagicMock(return_value=mock_stream_response)

        output_path = temp_dir / "model.glb"
        size = base_http_client.download_file(
            "https://example.com/model.glb",
            str(output_path),
        )

        expected_size = sum(len(c) for c in test_chunks)
        assert size == expected_size
        assert output_path.exists()

    def test_download_creates_directories(self, base_http_client, temp_dir):
        """Test that download creates parent directories."""
        mock_stream_response = MagicMock()
        mock_stream_response.__enter__ = MagicMock(return_value=mock_stream_response)
        mock_stream_response.__exit__ = MagicMock(return_value=False)
        mock_stream_response.raise_for_status = MagicMock()
        mock_stream_response.iter_bytes = MagicMock(return_value=iter([b"data"]))

        base_http_client.client.stream = MagicMock(return_value=mock_stream_response)

        # Nested path that doesn't exist
        output_path = temp_dir / "nested" / "deep" / "model.glb"
        base_http_client.download_file(
            "https://example.com/model.glb",
            str(output_path),
        )

        assert output_path.exists()


class TestBaseHttpClientContextManager:
    """Tests for context manager protocol."""

    def test_context_manager_closes_client(self, api_key):
        """Test that context manager closes the client."""
        with patch.dict(os.environ, {"MESHY_API_KEY": api_key}):
            with BaseHttpClient() as client:
                mock_close = MagicMock()
                client.client.close = mock_close

            mock_close.assert_called_once()
