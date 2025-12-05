"""Animation service for applying animations to rigged models (webhook-only).

For available animation IDs, use the animation catalog:
    from mesh_toolkit.catalog import AnimationGroups, DefaultAnimations

    animation_id = DefaultAnimations.OTTER_WALK
"""

from ..api.base_client import BaseHttpClient
from ..persistence.repository import TaskRepository
from ..persistence.schemas import TaskStatus, TaskSubmission


class AnimationService:
    """Handles applying animations to rigged models via webhooks."""

    def __init__(self, client: BaseHttpClient, repository: TaskRepository):
        self.client = client
        self.repository = repository

    def submit_task(
        self, species: str, model_id: str, animation_id: str, callback_url: str
    ) -> TaskSubmission:
        """Apply animation to a rigged model with webhook callback.

        Args:
            species: Species identifier for manifest tracking
            model_id: ID of rigged model task
            animation_id: ID from animation library
            callback_url: REQUIRED webhook URL for completion notification

        Returns:
            TaskSubmission with task_id and spec_hash for tracking
        """
        payload = {"model_id": model_id, "animation_id": animation_id, "callback_url": callback_url}

        response = self.client.request("POST", "animations", api_version="v1", json=payload)

        data = response.json()
        task_id = data["result"]

        if not task_id:
            msg = "Meshy API returned empty task_id"
            raise ValueError(msg)

        spec_hash = self.repository.compute_spec_hash(payload)

        submission = TaskSubmission(
            task_id=task_id,
            spec_hash=spec_hash,
            species=species,
            service="animation",
            status=TaskStatus.PENDING,
            callback_url=callback_url,
        )

        self.repository.record_task_submission(submission)

        return submission
