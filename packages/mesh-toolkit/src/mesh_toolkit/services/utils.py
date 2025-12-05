"""Shared utilities for Meshy services."""

from ..models import TaskStatus


def map_task_status(api_status: str) -> TaskStatus:
    """Map API status string to TaskStatus enum.

    Args:
        api_status: Status string from Meshy API

    Returns:
        TaskStatus enum value
    """
    status_map = {
        "PENDING": TaskStatus.PENDING,
        "IN_PROGRESS": TaskStatus.IN_PROGRESS,
        "SUCCEEDED": TaskStatus.SUCCEEDED,
        "FAILED": TaskStatus.FAILED,
        "EXPIRED": TaskStatus.EXPIRED,
    }

    return status_map.get(api_status, TaskStatus.PENDING)
