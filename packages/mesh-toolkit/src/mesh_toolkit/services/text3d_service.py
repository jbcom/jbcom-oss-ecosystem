"""Text-to-3D generation service (webhook-only)."""

from __future__ import annotations

from ..api.base_client import BaseHttpClient
from ..persistence.repository import TaskRepository
from ..persistence.schemas import TaskStatus, TaskSubmission


class Text3DService:
    """Handles text-to-3D model generation via webhooks."""

    def __init__(self, client: BaseHttpClient, repository: TaskRepository):
        self.client = client
        self.repository = repository

    def submit_task(
        self,
        project: str,
        prompt: str,
        callback_url: str,
        art_style: str = "sculpture",
        model_version: str = "latest",
        negative_prompt: str = "",
        enable_pbr: bool = True,
        enable_retexture: bool = True,
        seed: int | None = None,
    ) -> TaskSubmission:
        """Submit text-to-3D generation task with webhook callback.

        Args:
            project: Project identifier for manifest tracking
            prompt: Text description of the model
            callback_url: REQUIRED webhook URL for completion notification
            art_style: One of: realistic, sculpture, cartoon, low-poly
            model_version: "latest" or specific version
            negative_prompt: Things to avoid
            enable_pbr: Enable PBR materials
            enable_retexture: Allow retexturing later
            seed: Random seed for reproducibility

        Returns:
            TaskSubmission with task_id and spec_hash for tracking
        """
        payload = {
            "mode": "preview",
            "prompt": prompt,
            "art_style": art_style,
            "model_version": model_version,
            "negative_prompt": negative_prompt,
            "enable_pbr": enable_pbr,
            "ai_model": "meshy-4",
            "topology": "quad",
            "callback_url": callback_url,
        }

        if enable_retexture:
            payload["should_remesh"] = True

        if seed is not None:
            payload["seed"] = seed

        response = self.client.request("POST", "text-to-3d", api_version="v2", json=payload)

        data = response.json()
        task_id = data["result"]

        if not task_id:
            msg = "Meshy API returned empty task_id"
            raise ValueError(msg)

        spec_hash = self.repository.compute_spec_hash(payload)

        submission = TaskSubmission(
            task_id=task_id,
            spec_hash=spec_hash,
            project=project,
            service="text3d",
            status=TaskStatus.PENDING,
            callback_url=callback_url,
        )

        self.repository.record_task_submission(submission)

        return submission

    def refine_task(self, project: str, task_id: str, callback_url: str) -> TaskSubmission:
        """Refine preview to full quality model.

        Args:
            project: Project identifier
            task_id: Preview task ID to refine
            callback_url: Webhook URL for completion

        Returns:
            TaskSubmission for refinement task
        """
        response = self.client.request(
            "POST",
            f"text-to-3d/{task_id}/refine",
            api_version="v2",
            json={"callback_url": callback_url},
        )

        data = response.json()
        refine_task_id = data["result"]

        if not refine_task_id:
            msg = "Meshy API returned empty task_id"
            raise ValueError(msg)

        refine_payload = {"parent_task_id": task_id, "callback_url": callback_url}
        spec_hash = self.repository.compute_spec_hash(refine_payload)

        submission = TaskSubmission(
            task_id=refine_task_id,
            spec_hash=spec_hash,
            project=project,
            service="text3d_refine",
            status=TaskStatus.PENDING,
            callback_url=callback_url,
        )

        self.repository.record_task_submission(submission)

        return submission
