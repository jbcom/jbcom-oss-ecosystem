"""Retexturing service for generated models (webhook-only)."""

from ..api.base_client import BaseHttpClient
from ..persistence.repository import TaskRepository
from ..persistence.schemas import TaskStatus, TaskSubmission


class RetextureService:
    """Handles AI retexturing of 3D models via webhooks."""

    def __init__(self, client: BaseHttpClient, repository: TaskRepository):
        self.client = client
        self.repository = repository

    def submit_task(
        self,
        species: str,
        model_id: str,
        prompt: str,
        callback_url: str,
        art_style: str = "realistic",
        negative_prompt: str = "",
        enable_pbr: bool = True,
        resolution: str = "1024",
        seed: int | None = None,
    ) -> TaskSubmission:
        """Retexture a generated model with new prompt and webhook callback.

        Args:
            species: Species identifier for manifest tracking
            model_id: ID of text-to-3D task to retexture
            prompt: New texture description
            callback_url: REQUIRED webhook URL for completion notification
            art_style: One of: realistic, sculpture, cartoon
            negative_prompt: Things to avoid
            enable_pbr: Enable PBR materials
            resolution: "1024" or "2048"
            seed: Random seed for reproducibility

        Returns:
            TaskSubmission with task_id and spec_hash for tracking
        """
        payload = {
            "model_id": model_id,
            "prompt": prompt,
            "art_style": art_style,
            "negative_prompt": negative_prompt,
            "enable_pbr": enable_pbr,
            "resolution": resolution,
            "ai_model": "meshy-4",
            "callback_url": callback_url,
        }

        if seed is not None:
            payload["seed"] = seed

        response = self.client.request("POST", "retexture", api_version="v1", json=payload)

        data = response.json()
        task_id = data["result"]

        submission = TaskSubmission(
            task_id=task_id,
            spec_hash=self.repository.compute_spec_hash(payload),
            species=species,
            service="retexture",
            status=TaskStatus.PENDING,
            callback_url=callback_url,
        )

        self.repository.record_task_submission(submission)

        return submission
