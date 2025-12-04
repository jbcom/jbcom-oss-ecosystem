"""Pydantic schemas for Meshy webhook payloads"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class WebhookModelUrls(BaseModel):
    """Model URLs in webhook payload"""
    glb: Optional[str] = None
    fbx: Optional[str] = None
    usdz: Optional[str] = None
    obj: Optional[str] = None
    mtl: Optional[str] = None


class WebhookTextureUrls(BaseModel):
    """Texture URLs in webhook payload"""
    base_color: Optional[str] = None
    metallic: Optional[str] = None
    roughness: Optional[str] = None
    normal: Optional[str] = None
    ao: Optional[str] = None


class WebhookBasicAnimations(BaseModel):
    """Basic animations in rigging webhook"""
    walking_glb_url: Optional[str] = None
    walking_fbx_url: Optional[str] = None
    walking_armature_glb_url: Optional[str] = None
    running_glb_url: Optional[str] = None
    running_fbx_url: Optional[str] = None
    running_armature_glb_url: Optional[str] = None


class WebhookRiggingResult(BaseModel):
    """Rigging result in webhook payload"""
    rigged_character_fbx_url: Optional[str] = None
    rigged_character_glb_url: Optional[str] = None
    basic_animations: Optional[WebhookBasicAnimations] = None


class WebhookTaskError(BaseModel):
    """Error details in webhook payload"""
    message: Optional[str] = None
    code: Optional[str] = None


class MeshyWebhookPayload(BaseModel):
    """Webhook payload from Meshy API
    
    This represents the JSON payload sent by Meshy when a task completes.
    Different services (text3d, rigging, animation, retexture) send different fields.
    """
    id: str = Field(..., description="Task ID")
    status: str = Field(..., description="Task status: PENDING, IN_PROGRESS, SUCCEEDED, FAILED, EXPIRED")
    progress: int = Field(default=0, description="Progress percentage (0-100)")
    created_at: int = Field(..., description="Unix timestamp")
    started_at: Optional[int] = None
    finished_at: Optional[int] = None
    expires_at: Optional[int] = None
    
    # Text-to-3D specific fields
    model_urls: Optional[WebhookModelUrls] = None
    texture_urls: Optional[List[WebhookTextureUrls]] = None
    thumbnail_url: Optional[str] = None
    
    # Rigging specific fields
    result: Optional[WebhookRiggingResult] = None
    
    # Animation specific fields
    animation_glb_url: Optional[str] = None
    animation_fbx_url: Optional[str] = None
    video_url: Optional[str] = None
    
    # Error handling
    task_error: Optional[WebhookTaskError] = None
    
    # Metadata
    preceding_tasks: int = Field(default=0)
    
    def get_error_message(self) -> Optional[str]:
        """Extract error message from task_error field"""
        if self.task_error and self.task_error.message:
            return self.task_error.message
        return None
    
    def get_glb_url(self) -> Optional[str]:
        """Get GLB URL regardless of service type"""
        # Text-to-3D / Retexture
        if self.model_urls and self.model_urls.glb:
            return self.model_urls.glb
        
        # Rigging
        if self.result and self.result.rigged_character_glb_url:
            return self.result.rigged_character_glb_url
        
        # Animation
        if self.animation_glb_url:
            return self.animation_glb_url
        
        return None
    
    def get_all_urls(self) -> Dict[str, str]:
        """Get all available URLs as a flat dict"""
        urls = {}
        
        # Model URLs
        if self.model_urls:
            if self.model_urls.glb:
                urls["glb"] = self.model_urls.glb
            if self.model_urls.fbx:
                urls["fbx"] = self.model_urls.fbx
            if self.model_urls.usdz:
                urls["usdz"] = self.model_urls.usdz
            if self.model_urls.obj:
                urls["obj"] = self.model_urls.obj
            if self.model_urls.mtl:
                urls["mtl"] = self.model_urls.mtl
        
        # Rigging URLs
        if self.result:
            if self.result.rigged_character_glb_url:
                urls["glb"] = self.result.rigged_character_glb_url
            if self.result.rigged_character_fbx_url:
                urls["fbx"] = self.result.rigged_character_fbx_url
        
        # Animation URLs
        if self.animation_glb_url:
            urls["glb"] = self.animation_glb_url
        if self.animation_fbx_url:
            urls["fbx"] = self.animation_fbx_url
        if self.video_url:
            urls["video"] = self.video_url
        
        # Thumbnail
        if self.thumbnail_url:
            urls["thumbnail"] = self.thumbnail_url
        
        return urls
