"""Tests for service layer (Text3DService)."""

from unittest.mock import MagicMock

import pytest

from mesh_toolkit.persistence.schemas import TaskStatus
from mesh_toolkit.services.text3d_service import Text3DService


class TestText3DService:
    """Tests for Text3DService."""

    @pytest.fixture
    def mock_client(self, mock_response):
        """Create a mock BaseHttpClient."""
        client = MagicMock()
        client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "task-12345-abcde"},
        )
        return client

    @pytest.fixture
    def mock_repository(self, temp_dir):
        """Create a mock TaskRepository."""
        repo = MagicMock()
        repo.compute_spec_hash.return_value = "hash-abc123"
        repo.record_task_submission.return_value = None
        return repo

    @pytest.fixture
    def text3d_service(self, mock_client, mock_repository):
        """Create Text3DService with mocks."""
        return Text3DService(client=mock_client, repository=mock_repository)

    def test_submit_task_basic(self, text3d_service, mock_client, mock_repository):
        """Test basic task submission."""
        submission = text3d_service.submit_task(
            species="otter",
            prompt="An otter character",
            callback_url="https://example.com/webhook",
        )

        assert submission.task_id == "task-12345-abcde"
        assert submission.species == "otter"
        assert submission.service == "text3d"
        assert submission.status == TaskStatus.PENDING
        assert submission.callback_url == "https://example.com/webhook"

        # Verify API call
        mock_client.request.assert_called_once()
        call_args = mock_client.request.call_args
        assert call_args[0][0] == "POST"
        assert call_args[0][1] == "text-to-3d"
        assert call_args[1]["api_version"] == "v2"

    def test_submit_task_with_options(self, text3d_service, mock_client):
        """Test task submission with all options."""
        submission = text3d_service.submit_task(
            species="beaver",
            prompt="A beaver building a dam",
            callback_url="https://example.com/webhook",
            art_style="cartoon",
            model_version="meshy-4",
            negative_prompt="low quality, blurry",
            enable_pbr=True,
            enable_retexture=True,
            seed=12345,
        )

        assert submission.task_id == "task-12345-abcde"

        # Verify payload
        call_args = mock_client.request.call_args
        payload = call_args[1]["json"]
        assert payload["prompt"] == "A beaver building a dam"
        assert payload["art_style"] == "cartoon"
        assert payload["negative_prompt"] == "low quality, blurry"
        assert payload["enable_pbr"] is True
        assert payload["should_remesh"] is True
        assert payload["seed"] == 12345
        assert payload["callback_url"] == "https://example.com/webhook"

    def test_submit_task_records_to_repository(
        self, text3d_service, mock_repository
    ):
        """Test that submission is recorded in repository."""
        text3d_service.submit_task(
            species="otter",
            prompt="Test prompt",
            callback_url="https://example.com/webhook",
        )

        mock_repository.record_task_submission.assert_called_once()
        call_args = mock_repository.record_task_submission.call_args
        submission = call_args[0][0]
        assert submission.task_id == "task-12345-abcde"
        assert submission.spec_hash == "hash-abc123"

    def test_submit_task_empty_task_id_raises(self, text3d_service, mock_client, mock_response):
        """Test that empty task_id raises error."""
        mock_client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": ""},  # Empty task_id
        )

        with pytest.raises(ValueError, match="empty task_id"):
            text3d_service.submit_task(
                species="otter",
                prompt="Test",
                callback_url="https://example.com/webhook",
            )

    def test_refine_task(self, text3d_service, mock_client, mock_response):
        """Test refining a preview task."""
        mock_client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": "refine-task-67890"},
        )

        submission = text3d_service.refine_task(
            species="otter",
            task_id="preview-task-12345",
            callback_url="https://example.com/webhook",
        )

        assert submission.task_id == "refine-task-67890"
        assert submission.service == "text3d_refine"

        # Verify API call
        call_args = mock_client.request.call_args
        assert call_args[0][0] == "POST"
        assert "preview-task-12345/refine" in call_args[0][1]

    def test_refine_task_empty_task_id_raises(
        self, text3d_service, mock_client, mock_response
    ):
        """Test that refine with empty task_id raises error."""
        mock_client.request.return_value = mock_response(
            status_code=200,
            json_data={"result": ""},
        )

        with pytest.raises(ValueError, match="empty task_id"):
            text3d_service.refine_task(
                species="otter",
                task_id="preview-task-12345",
                callback_url="https://example.com/webhook",
            )
