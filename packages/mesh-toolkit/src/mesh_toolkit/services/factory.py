"""Service factory for mesh_toolkit services with proper dependency injection."""

from __future__ import annotations

import os
import threading

from ..api.base_client import BaseHttpClient
from ..persistence.repository import TaskRepository
from .animation_service import AnimationService
from .retexture_service import RetextureService
from .rigging_service import RiggingService
from .text3d_service import Text3DService


class ServiceFactory:
    """Factory for creating mesh_toolkit services with shared dependencies.

    Usage:
        factory = ServiceFactory()
        text3d = factory.text3d()
        rigging = factory.rigging()

    Or with custom config:
        factory = ServiceFactory(
            api_key="your-key",
            base_path="custom/models/path",
            webhook_base_url="https://your-server.com/webhooks"
        )
    """

    # Use localhost for local development (0.0.0.0 is non-routable for callbacks)
    DEFAULT_WEBHOOK_BASE = "http://localhost:8000/webhooks/meshy"

    def __init__(
        self,
        api_key: str | None = None,
        base_path: str = "client/public/models",
        webhook_base_url: str | None = None,
    ):
        """Initialize service factory.

        Args:
            api_key: Meshy API key (defaults to MESHY_API_KEY env var)
            base_path: Base path for model storage
            webhook_base_url: Base URL for webhooks (e.g., http://host:8000/webhooks/meshy)
        """
        self._api_key = api_key
        self._base_path = base_path
        self._webhook_base_url = webhook_base_url or os.getenv(
            "MESHY_WEBHOOK_BASE_URL", self.DEFAULT_WEBHOOK_BASE
        )

        # Lazy-loaded shared dependencies
        self._client: BaseHttpClient | None = None
        self._repository: TaskRepository | None = None

    @property
    def client(self) -> BaseHttpClient:
        """Lazy-load HTTP client."""
        if self._client is None:
            self._client = BaseHttpClient(api_key=self._api_key)
        return self._client

    @property
    def repository(self) -> TaskRepository:
        """Lazy-load task repository."""
        if self._repository is None:
            self._repository = TaskRepository(base_path=self._base_path)
        return self._repository

    def webhook_url(self, project: str, endpoint: str) -> str:
        """Generate webhook URL for a project/endpoint combination."""
        return f"{self._webhook_base_url}/{project}/{endpoint}"

    def text3d(self) -> Text3DService:
        """Create Text3DService instance."""
        return Text3DService(client=self.client, repository=self.repository)

    def rigging(self) -> RiggingService:
        """Create RiggingService instance."""
        return RiggingService(client=self.client, repository=self.repository)

    def animation(self) -> AnimationService:
        """Create AnimationService instance."""
        return AnimationService(client=self.client, repository=self.repository)

    def retexture(self) -> RetextureService:
        """Create RetextureService instance."""
        return RetextureService(client=self.client, repository=self.repository)

    def close(self):
        """Close shared resources."""
        if self._client:
            self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


# Module-level singleton for convenience (thread-safe)
_default_factory: ServiceFactory | None = None
_factory_lock = threading.Lock()


def get_factory() -> ServiceFactory:
    """Get or create default service factory singleton (thread-safe)."""
    global _default_factory
    if _default_factory is None:
        with _factory_lock:
            # Double-checked locking pattern
            if _default_factory is None:
                _default_factory = ServiceFactory()
    return _default_factory


def reset_factory():
    """Reset the default factory (useful for testing)."""
    global _default_factory
    with _factory_lock:
        if _default_factory:
            _default_factory.close()
        _default_factory = None
