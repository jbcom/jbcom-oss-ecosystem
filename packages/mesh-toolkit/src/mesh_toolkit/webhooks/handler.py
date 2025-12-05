"""Webhook handler for Meshy API callbacks."""

import hashlib
from datetime import datetime
from typing import Any

from ..api.base_client import BaseHttpClient
from ..persistence.repository import TaskRepository
from ..persistence.schemas import ArtifactRecord
from .schemas import MeshyWebhookPayload


class WebhookHandler:
    """Handle webhook callbacks from Meshy API.

    This class processes webhook payloads, updates task state in the repository,
    and downloads artifacts on successful completion.

    For testing purposes, signature verification is stubbed out.
    """

    def __init__(
        self,
        repository: TaskRepository,
        client: BaseHttpClient | None = None,
        download_artifacts: bool = True,
    ):
        """Initialize webhook handler.

        Args:
            repository: TaskRepository for updating state
            client: Optional HTTP client for downloading artifacts
            download_artifacts: Whether to download GLB files on SUCCEEDED
        """
        self.repository = repository
        self.client = client
        self.download_artifacts = download_artifacts

    def handle_webhook(
        self, payload: MeshyWebhookPayload, species: str | None = None, spec_hash: str | None = None
    ) -> dict[str, Any]:
        """Process webhook payload and update repository.

        Args:
            payload: Parsed webhook payload
            species: Optional species name (will search if not provided)
            spec_hash: Optional spec hash (will search if not provided)

        Returns:
            Dict with status and details
        """
        # Find the task in repository
        task_lookup = self.repository.find_task_by_id(task_id=payload.id, species=species)

        if not task_lookup:
            return {
                "status": "error",
                "message": f"Task {payload.id} not found in repository",
                "task_id": payload.id,
            }

        found_species, found_spec_hash, asset_manifest = task_lookup

        # Determine service type from task graph
        service_name = None
        for task_entry in asset_manifest.task_graph:
            if task_entry.task_id == payload.id:
                service_name = task_entry.service
                break

        if not service_name:
            return {
                "status": "error",
                "message": f"Task {payload.id} not found in task graph",
                "task_id": payload.id,
            }

        # Extract error message if failed
        error_message = None
        if payload.status == "FAILED":
            error_message = payload.get_error_message()

        # Get result URLs
        result_paths = payload.get_all_urls()

        # Download artifacts if SUCCEEDED and download enabled
        artifacts = []
        if payload.status == "SUCCEEDED" and self.download_artifacts and self.client:
            glb_url = payload.get_glb_url()
            if glb_url:
                artifact = self._download_glb_artifact(
                    species=found_species,
                    spec_hash=found_spec_hash,
                    service=service_name,
                    glb_url=glb_url,
                )
                if artifact:
                    artifacts.append(artifact)

        # Update repository
        self.repository.record_task_update(
            species=found_species,
            spec_hash=found_spec_hash,
            task_id=payload.id,
            status=payload.status,
            result_paths=result_paths,
            artifacts=artifacts if artifacts else None,
            source="webhook",
            error=error_message,
        )

        return {
            "status": "success",
            "task_id": payload.id,
            "species": found_species,
            "spec_hash": found_spec_hash,
            "service": service_name,
            "task_status": payload.status,
            "artifacts_downloaded": len(artifacts),
        }

    def _download_glb_artifact(
        self, species: str, spec_hash: str, service: str, glb_url: str
    ) -> ArtifactRecord | None:
        """Download GLB artifact and create record.

        Args:
            species: Species name
            spec_hash: Asset spec hash
            service: Service name (text3d, rigging, etc)
            glb_url: GLB download URL

        Returns:
            ArtifactRecord if successful, None otherwise
        """
        if not self.client:
            return None

        try:
            # Determine output path
            species_dir = self.repository.base_path / species
            filename = f"{spec_hash}_{service}.glb"
            output_path = species_dir / filename

            # Download file
            file_size = self.client.download_file(glb_url, str(output_path))

            # Compute hash
            with open(output_path, "rb") as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()

            # Create artifact record
            return ArtifactRecord(
                relative_path=filename,
                sha256_hash=file_hash,
                file_size_bytes=file_size,
                downloaded_at=datetime.utcnow(),
                source_url=glb_url,
            )

        except Exception:
            return None

    def verify_signature(self, payload: bytes, signature: str) -> bool:
        """Verify webhook signature (stubbed for testing).

        In production, this would verify HMAC signature using webhook secret.
        For testing, we always return True.

        Args:
            payload: Raw webhook payload bytes
            signature: Signature header value

        Returns:
            True if signature is valid (always True for testing)
        """
        # TODO: Implement HMAC-SHA256 verification in production
        # Example:
        # webhook_secret = os.getenv("MESHY_WEBHOOK_SECRET")
        # expected = hmac.new(
        #     webhook_secret.encode(),
        #     payload,
        #     hashlib.sha256
        # ).hexdigest()
        # return hmac.compare_digest(signature, expected)

        return True  # Stub for testing
