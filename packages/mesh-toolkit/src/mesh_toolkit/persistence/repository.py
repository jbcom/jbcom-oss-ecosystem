"""Task repository for manifest storage and retrieval"""
import os
import json
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from .schemas import (
    SpeciesManifest, 
    AssetManifest, 
    TaskGraphEntry,
    ArtifactRecord,
    StatusHistoryEntry,
    TaskSubmission,
    TaskStatus
)
from .utils import compute_spec_hash as util_compute_spec_hash, canonicalize_spec


class TaskRepository:
    """File-backed repository for task manifests with atomic operations"""
    
    def __init__(self, base_path: str = "client/public/models"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def _manifest_path(self, species: str) -> Path:
        """Get path to species manifest file"""
        return self.base_path / species / "manifest.json"
    
    def load_species_manifest(self, species: str) -> SpeciesManifest:
        """Load manifest for a species, creating empty one if missing
        
        Args:
            species: Species name (e.g., "otter", "beaver")
        
        Returns:
            SpeciesManifest instance
        """
        manifest_path = self._manifest_path(species)
        
        if not manifest_path.exists():
            # Create empty manifest
            manifest = SpeciesManifest(species=species)
            self.save_species_manifest(manifest)
            return manifest
        
        with open(manifest_path, 'r') as f:
            data = json.load(f)
            return SpeciesManifest(**data)
    
    def save_species_manifest(self, manifest: SpeciesManifest) -> None:
        """Atomically save species manifest to disk
        
        Args:
            manifest: SpeciesManifest to save
        """
        manifest.last_updated = datetime.utcnow()
        manifest_path = self._manifest_path(manifest.species)
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Serialize Pydantic model with datetime → ISO string conversion
        manifest_dict = manifest.model_dump(mode="json")
        
        # Atomic write: write to temp file, then rename
        with tempfile.NamedTemporaryFile(
            mode='w',
            dir=manifest_path.parent,
            delete=False,
            suffix='.tmp'
        ) as tmp_file:
            json.dump(manifest_dict, tmp_file, indent=2)
            tmp_path = tmp_file.name
        
        # Atomic rename
        os.replace(tmp_path, manifest_path)
    
    def get_asset_record(
        self,
        species: str,
        spec_hash: str
    ) -> Optional[AssetManifest]:
        """Get asset manifest by spec hash
        
        Args:
            species: Species name
            spec_hash: Asset spec hash
        
        Returns:
            AssetManifest if found, None otherwise
        """
        manifest = self.load_species_manifest(species)
        return manifest.asset_specs.get(spec_hash)
    
    def upsert_asset_record(
        self,
        species: str,
        asset_manifest: AssetManifest
    ) -> None:
        """Insert or update asset manifest
        
        Args:
            species: Species name
            asset_manifest: AssetManifest to save
        """
        manifest = self.load_species_manifest(species)
        asset_manifest.updated_at = datetime.utcnow()
        manifest.asset_specs[asset_manifest.asset_spec_hash] = asset_manifest
        self.save_species_manifest(manifest)
    
    def record_task_update(
        self,
        species: str,
        spec_hash: str,
        task_id: str,
        status: str,
        service: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        result_paths: Optional[Dict[str, str]] = None,
        artifacts: Optional[List[ArtifactRecord]] = None,
        source: str = "orchestrator",
        error: Optional[str] = None
    ) -> None:
        """Record task status update in manifest
        
        Args:
            species: Species name
            spec_hash: Asset spec hash
            task_id: Meshy task ID
            status: New status string
            service: Service name (text3d, rigging, etc)
            payload: Request payload
            result_paths: Result URLs/paths
            artifacts: Downloaded artifacts
            source: Update source (orchestrator, webhook, manual)
            error: Error message if failed
        """
        manifest = self.load_species_manifest(species)
        asset_record = manifest.asset_specs.get(spec_hash)
        
        if not asset_record:
            raise ValueError(f"Asset {spec_hash} not found for species {species}")
        
        # Find existing task entry or create new
        task_entry = None
        for entry in asset_record.task_graph:
            if entry.task_id == task_id:
                task_entry = entry
                break
        
        if task_entry:
            # Update existing entry
            old_status = task_entry.status
            task_entry.status = status
            task_entry.updated_at = datetime.utcnow()
            
            if result_paths:
                task_entry.result_paths.update(result_paths)
            
            if error:
                task_entry.error = error
            
            # Record status transition
            asset_record.history.append(StatusHistoryEntry(
                timestamp=datetime.utcnow(),
                old_status=old_status,
                new_status=status,
                source=source,
                task_id=task_id
            ))
        
        elif service:
            # Create new task entry
            task_entry = TaskGraphEntry(
                task_id=task_id,
                service=service,
                status=status,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                payload=payload or {},
                result_paths=result_paths or {},
                error=error
            )
            asset_record.task_graph.append(task_entry)
            
            # Record initial status
            asset_record.history.append(StatusHistoryEntry(
                timestamp=datetime.utcnow(),
                old_status="",
                new_status=status,
                source=source,
                task_id=task_id
            ))
        
        # Add artifacts if provided
        if artifacts:
            asset_record.artifacts.extend(artifacts)
        
        # Save updated manifest
        self.save_species_manifest(manifest)
    
    def list_pending_assets(self, species: str) -> List[AssetManifest]:
        """List all assets with pending/in-progress tasks
        
        Args:
            species: Species name
        
        Returns:
            List of AssetManifest with non-terminal tasks
        """
        manifest = self.load_species_manifest(species)
        pending = []
        
        terminal_statuses = {"SUCCEEDED", "FAILED", "EXPIRED", "CANCELED"}
        
        for asset_record in manifest.asset_specs.values():
            has_pending = any(
                task.status not in terminal_statuses
                for task in asset_record.task_graph
            )
            if has_pending:
                pending.append(asset_record)
        
        return pending
    
    def find_task_by_id(
        self,
        task_id: str,
        species: Optional[str] = None
    ) -> Optional[tuple[str, str, AssetManifest]]:
        """Find asset by task ID (for webhook lookups)
        
        Args:
            task_id: Meshy task ID
            species: Optional species to narrow search
        
        Returns:
            Tuple of (species, spec_hash, AssetManifest) if found
        """
        # Determine which species to search
        if species:
            species_list = [species]
        else:
            # Search all species directories
            species_list = [
                d.name for d in self.base_path.iterdir()
                if d.is_dir() and (d / "manifest.json").exists()
            ]
        
        for sp in species_list:
            manifest = self.load_species_manifest(sp)
            for spec_hash, asset_record in manifest.asset_specs.items():
                for task in asset_record.task_graph:
                    if task.task_id == task_id:
                        return (sp, spec_hash, asset_record)
        
        return None
    
    def compute_spec_hash(self, spec: Dict[str, Any]) -> str:
        """Compute deterministic hash for task spec
        
        Args:
            spec: Task specification dictionary
        
        Returns:
            SHA256 hex digest of canonicalized spec
        """
        return util_compute_spec_hash(spec)
    
    def record_task_submission(self, submission: TaskSubmission) -> None:
        """Record a task submission to the manifest (idempotent)
        
        Args:
            submission: TaskSubmission with task_id, species, service, etc.
        
        Raises:
            ValueError: If submission data is invalid
        """
        if not submission.task_id:
            raise ValueError("task_id cannot be empty")
        if not submission.callback_url:
            raise ValueError("callback_url cannot be empty")
        if not submission.species:
            raise ValueError("species cannot be empty")
        if not submission.spec_hash:
            raise ValueError("spec_hash cannot be empty")
        
        manifest = self.load_species_manifest(submission.species)
        
        asset_record = manifest.asset_specs.get(submission.spec_hash)
        if not asset_record:
            asset_record = AssetManifest(
                asset_spec_hash=submission.spec_hash,
                spec_fingerprint=submission.spec_hash,
                species=submission.species,
                asset_intent="creature"
            )
            manifest.asset_specs[submission.spec_hash] = asset_record
        
        # Idempotency: if task_id already exists with same status, short-circuit (webhook retry)
        for existing_task in asset_record.task_graph:
            if existing_task.task_id == submission.task_id:
                if existing_task.status == submission.status.value:
                    # Duplicate submission with same status - idempotent, return silently
                    return
                else:
                    raise ValueError(
                        f"Task {submission.task_id} already exists with different status: "
                        f"{existing_task.status} != {submission.status.value}"
                    )
        
        task_entry = TaskGraphEntry(
            task_id=submission.task_id,
            service=submission.service,
            status=submission.status.value,
            created_at=submission.created_at,
            updated_at=submission.updated_at,
            payload={"callback_url": submission.callback_url},
            result_paths={},
            error=None
        )
        asset_record.task_graph.append(task_entry)
        
        asset_record.history.append(StatusHistoryEntry(
            timestamp=datetime.utcnow(),
            old_status="",
            new_status=submission.status.value,
            source="service",
            task_id=submission.task_id
        ))
        
        self.save_species_manifest(manifest)
