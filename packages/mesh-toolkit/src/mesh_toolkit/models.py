"""Pydantic models for Meshy API types"""
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"


class ArtStyle(str, Enum):
    REALISTIC = "realistic"
    CARTOON = "cartoon"
    LOW_POLY = "low-poly"
    SCULPT = "sculpt"
    PBR = "pbr"


class TexturePBRMapType(str, Enum):
    BASE_COLOR = "baseColor"
    METALLIC = "metallic"
    ROUGHNESS = "roughness"
    NORMAL = "normal"
    AO = "ao"


# Text-to-3D Models

class Text3DRequest(BaseModel):
    mode: str = Field(default="preview", description="preview or refine")
    prompt: str
    art_style: ArtStyle = ArtStyle.REALISTIC
    negative_prompt: Optional[str] = None
    ai_model: Optional[str] = None
    topology: Optional[str] = None  # quad, triangle
    target_polycount: Optional[int] = None
    enable_pbr: Optional[bool] = None


class ModelUrls(BaseModel):
    glb: Optional[str] = None
    fbx: Optional[str] = None
    usdz: Optional[str] = None
    obj: Optional[str] = None
    mtl: Optional[str] = None


class TextureUrls(BaseModel):
    base_color: Optional[str] = None
    metallic: Optional[str] = None
    roughness: Optional[str] = None
    normal: Optional[str] = None
    ao: Optional[str] = None


class Text3DResult(BaseModel):
    id: str
    status: TaskStatus
    progress: int = 0
    created_at: int
    started_at: Optional[int] = None
    finished_at: Optional[int] = None
    model_urls: Optional[ModelUrls] = None
    texture_urls: Optional[List[TextureUrls]] = None
    thumbnail_url: Optional[str] = None
    error: Optional[str] = None


# Task classes for services
class Text3DTask(BaseModel):
    task_id: str
    prompt: str = ""
    art_style: str = ""
    status: TaskStatus = TaskStatus.PENDING
    progress: int = 0
    thumbnail_url: Optional[str] = None
    model_urls: Dict[str, str] = Field(default_factory=dict)
    error: Optional[str] = None


class RiggingTask(BaseModel):
    task_id: str
    model_id: str = ""
    status: TaskStatus = TaskStatus.PENDING
    progress: int = 0
    thumbnail_url: Optional[str] = None
    model_urls: Dict[str, str] = Field(default_factory=dict)
    error: Optional[str] = None


class AnimationTask(BaseModel):
    task_id: str
    model_id: str = ""
    animation_id: str = ""
    status: TaskStatus = TaskStatus.PENDING
    progress: int = 0
    video_url: Optional[str] = None
    model_urls: Dict[str, str] = Field(default_factory=dict)
    error: Optional[str] = None


class RetextureTask(BaseModel):
    task_id: str
    model_id: str = ""
    prompt: str = ""
    art_style: str = ""
    status: TaskStatus = TaskStatus.PENDING
    progress: int = 0
    thumbnail_url: Optional[str] = None
    model_urls: Dict[str, str] = Field(default_factory=dict)
    error: Optional[str] = None


class AnimationAction(BaseModel):
    id: str
    name: str
    category: str = ""
    duration: float = 0.0
    preview_url: Optional[str] = None


# Text-to-Texture Models

class TextTextureRequest(BaseModel):
    model_url: str
    prompt: str
    art_style: ArtStyle = ArtStyle.REALISTIC
    negative_prompt: Optional[str] = None
    ai_model: Optional[str] = None
    resolution: Optional[str] = "1024"  # 1024, 2048, 4096
    enable_pbr: Optional[bool] = True


class TextTextureResult(BaseModel):
    id: str
    status: TaskStatus
    progress: int = 0
    created_at: int
    started_at: Optional[int] = None
    finished_at: Optional[int] = None
    texture_urls: Optional[List[TextureUrls]] = None
    thumbnail_url: Optional[str] = None
    error: Optional[str] = None


# Image-to-3D Models

class Image3DRequest(BaseModel):
    mode: str = Field(default="preview", description="preview or refine")
    image_url: str
    ai_model: Optional[str] = None
    topology: Optional[str] = None
    target_polycount: Optional[int] = None
    enable_pbr: Optional[bool] = None


class Image3DResult(BaseModel):
    id: str
    status: TaskStatus
    progress: int = 0
    created_at: int
    started_at: Optional[int] = None
    finished_at: Optional[int] = None
    model_urls: Optional[ModelUrls] = None
    texture_urls: Optional[List[TextureUrls]] = None
    thumbnail_url: Optional[str] = None
    error: Optional[str] = None


# Rigging Models

class RiggingRequest(BaseModel):
    input_task_id: Optional[str] = None
    model_url: Optional[str] = None
    height_meters: float = 1.7
    texture_image_url: Optional[str] = None


class BasicAnimations(BaseModel):
    walking_glb_url: Optional[str] = None
    walking_fbx_url: Optional[str] = None
    walking_armature_glb_url: Optional[str] = None
    running_glb_url: Optional[str] = None
    running_fbx_url: Optional[str] = None
    running_armature_glb_url: Optional[str] = None


class RiggingResultData(BaseModel):
    rigged_character_fbx_url: Optional[str] = None
    rigged_character_glb_url: Optional[str] = None
    basic_animations: Optional[BasicAnimations] = None


class RiggingResult(BaseModel):
    id: str
    status: TaskStatus
    progress: int = 0
    created_at: int
    started_at: Optional[int] = None
    finished_at: Optional[int] = None
    expires_at: Optional[int] = None
    task_error: Optional[Dict[str, Any]] = None
    result: Optional[RiggingResultData] = None
    preceding_tasks: int = 0


# Animation Models

class AnimationRequest(BaseModel):
    rig_task_id: str
    action_id: int
    loop: Optional[bool] = True
    frame_rate: Optional[int] = 30


class AnimationResult(BaseModel):
    id: str
    status: TaskStatus
    progress: int = 0
    created_at: int
    started_at: Optional[int] = None
    finished_at: Optional[int] = None
    expires_at: Optional[int] = None
    animation_glb_url: Optional[str] = None
    animation_fbx_url: Optional[str] = None
    task_error: Optional[Dict[str, Any]] = None
    preceding_tasks: int = 0


# Retexture Models

class RetextureRequest(BaseModel):
    input_task_id: Optional[str] = None
    model_url: Optional[str] = None
    text_style_prompt: Optional[str] = None
    image_style_url: Optional[str] = None
    ai_model: str = "latest"
    enable_original_uv: bool = True
    enable_pbr: bool = False


class RetextureResult(BaseModel):
    id: str
    status: TaskStatus
    progress: int = 0
    created_at: int
    started_at: Optional[int] = None
    finished_at: Optional[int] = None
    expires_at: Optional[int] = None
    model_urls: Optional[ModelUrls] = None
    texture_urls: Optional[List[TextureUrls]] = None
    thumbnail_url: Optional[str] = None
    text_style_prompt: Optional[str] = None
    image_style_url: Optional[str] = None
    task_error: Optional[Dict[str, Any]] = None
    preceding_tasks: int = 0


# Asset Intent (for game context)

class AssetIntent(str, Enum):
    PLAYER_CHARACTER = "player_character"
    NPC_CHARACTER = "npc_character"
    CREATURE_PREDATOR = "creature_predator"
    CREATURE_PREY = "creature_prey"
    PROP_INTERACTABLE = "prop_interactable"
    PROP_DECORATION = "prop_decoration"
    TERRAIN_ELEMENT = "terrain_element"
    TEXTURE_TERRAIN = "texture_terrain"
    TEXTURE_MATERIAL = "texture_material"


class GameAssetSpec(BaseModel):
    """High-level spec for game asset generation"""
    intent: AssetIntent
    description: str
    art_style: ArtStyle = ArtStyle.REALISTIC
    target_polycount: Optional[int] = None
    enable_pbr: bool = True
    output_path: str = Field(description="Relative path in client/public/")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    asset_id: Optional[str] = Field(default=None, description="Unique asset identifier (auto-generated if not provided)")
