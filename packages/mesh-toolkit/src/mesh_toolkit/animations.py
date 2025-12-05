"""Meshy Animation Library - Loads from synced catalog."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import ClassVar


@dataclass
class AnimationMeta:
    """Metadata for a Meshy animation."""

    id: int
    name: str
    category: str
    subcategory: str
    preview_url: str = ""


class AnimationCatalog:
    """Loads and queries the animation catalog from JSON."""

    _instance: ClassVar[AnimationCatalog | None] = None
    _animations: dict[int, AnimationMeta]

    def __init__(self, catalog_path: Path | str | None = None):
        """Initialize catalog from JSON file.

        Args:
            catalog_path: Path to animations.json. If None, uses default location.
        """
        self._animations = {}

        if catalog_path is None:
            # Default: look for catalog/animations.json relative to this file
            catalog_path = Path(__file__).parent / "catalog" / "animations.json"

        if isinstance(catalog_path, str):
            catalog_path = Path(catalog_path)

        if catalog_path.exists():
            self._load_catalog(catalog_path)

    def _load_catalog(self, path: Path) -> None:
        """Load animations from JSON file."""
        with open(path) as f:
            data = json.load(f)

        for anim in data.get("animations", []):
            self._animations[anim["id"]] = AnimationMeta(
                id=anim["id"],
                name=anim.get("name", f"Animation_{anim['id']}"),
                category=anim.get("category", "Unknown"),
                subcategory=anim.get("subcategory", "Unknown"),
                preview_url=anim.get("preview_url", ""),
            )

    @classmethod
    def get_instance(cls) -> AnimationCatalog:
        """Get singleton instance of catalog."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get(self, animation_id: int) -> AnimationMeta:
        """Get animation by ID.

        Args:
            animation_id: Animation ID from Meshy API

        Returns:
            AnimationMeta for the animation

        Raises:
            ValueError: If animation ID not found
        """
        if animation_id not in self._animations:
            msg = f"Animation ID {animation_id} not found in catalog"
            raise ValueError(msg)
        return self._animations[animation_id]

    def list_by_category(self, category: str) -> list[AnimationMeta]:
        """Get all animations in a category."""
        return [a for a in self._animations.values() if a.category == category]

    def list_by_subcategory(self, subcategory: str) -> list[AnimationMeta]:
        """Get all animations in a subcategory."""
        return [a for a in self._animations.values() if a.subcategory == subcategory]

    def search(self, query: str) -> list[AnimationMeta]:
        """Search animations by name."""
        query = query.lower()
        return [a for a in self._animations.values() if query in a.name.lower()]

    @property
    def all(self) -> list[AnimationMeta]:
        """Get all animations."""
        return list(self._animations.values())

    @property
    def categories(self) -> set[str]:
        """Get all unique categories."""
        return {a.category for a in self._animations.values()}

    @property
    def subcategories(self) -> set[str]:
        """Get all unique subcategories."""
        return {a.subcategory for a in self._animations.values()}

    def __len__(self) -> int:
        return len(self._animations)

    def __contains__(self, animation_id: int) -> bool:
        return animation_id in self._animations


# Convenience functions using singleton


def get_animation(animation_id: int) -> AnimationMeta:
    """Get animation by ID from default catalog."""
    return AnimationCatalog.get_instance().get(animation_id)


def get_animations_by_category(category: str) -> list[AnimationMeta]:
    """Get all animations in a category."""
    return AnimationCatalog.get_instance().list_by_category(category)


def get_animations_by_subcategory(subcategory: str) -> list[AnimationMeta]:
    """Get all animations in a subcategory."""
    return AnimationCatalog.get_instance().list_by_subcategory(subcategory)


def search_animations(query: str) -> list[AnimationMeta]:
    """Search animations by name."""
    return AnimationCatalog.get_instance().search(query)
