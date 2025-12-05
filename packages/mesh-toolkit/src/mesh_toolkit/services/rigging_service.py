"""Auto-rigging service for generated models (webhook-only)"""
from ..api.base_client import BaseHttpClient
from ..persistence.repository import TaskRepository
from ..persistence.schemas import TaskSubmission, TaskStatus


class RiggingService:
    """Handles automatic rigging of 3D models via webhooks"""
    
    def __init__(self, client: BaseHttpClient, repository: TaskRepository):
        self.client = client
        self.repository = repository
    
    def submit_task(
        self,
        species: str,
        model_id: str,
        callback_url: str
    ) -> TaskSubmission:
        """Auto-rig a generated model with webhook callback
        
        Args:
            species: Species identifier for manifest tracking
            model_id: ID of text-to-3D task to rig
            callback_url: REQUIRED webhook URL for completion notification
        
        Returns:
            TaskSubmission with task_id and spec_hash for tracking
        """
        payload = {
            "model_id": model_id,
            "callback_url": callback_url
        }
        
        response = self.client.request(
            "POST",
            "rigging",
            api_version="v1",
            json=payload
        )
        
        data = response.json()
        task_id = data["result"]
        
        if not task_id:
            raise ValueError("Meshy API returned empty task_id")
        
        spec_hash = self.repository.compute_spec_hash(payload)
        
        submission = TaskSubmission(
            task_id=task_id,
            spec_hash=spec_hash,
            species=species,
            service="rigging",
            status=TaskStatus.PENDING,
            callback_url=callback_url
        )
        
        self.repository.record_task_submission(submission)
        
        return submission
