"""Meshy API client with rate limiting and error handling"""
import os
import time
import asyncio
from typing import Optional, Dict, Any, Union
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from .models import (
    Text3DRequest, Text3DResult,
    TextTextureRequest, TextTextureResult,
    Image3DRequest, Image3DResult,
    RiggingRequest, RiggingResult,
    AnimationRequest, AnimationResult,
    RetextureRequest, RetextureResult,
    TaskStatus
)


class RateLimitError(Exception):
    """Raised when API rate limit is hit"""
    pass


class MeshyClient:
    """Client for Meshy API with rate limiting and retries"""
    
    BASE_URL = "https://api.meshy.ai"
    API_VERSION = "v2"
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        timeout: float = 300.0,
        max_retries: int = 3
    ):
        self.api_key = api_key or os.getenv("MESHY_API_KEY")
        if not self.api_key:
            raise ValueError("MESHY_API_KEY not set")
        
        self.timeout = timeout
        self.max_retries = max_retries
        self.client = httpx.Client(timeout=timeout)
        self.async_client = httpx.AsyncClient(timeout=timeout)
        
        # Rate limiting state
        self.last_request_time = 0
        self.min_request_interval = 0.5  # 500ms between requests
    
    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def _rate_limit(self):
        """Simple rate limiting"""
        now = time.time()
        time_since_last = now - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    @retry(
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException, RateLimitError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> httpx.Response:
        """Make HTTP request with retries"""
        self._rate_limit()
        
        url = f"{self.BASE_URL}/{self.API_VERSION}/{endpoint}"
        response = self.client.request(
            method,
            url,
            headers=self._headers(),
            **kwargs
        )
        
        if response.status_code == 429:
            # Respect retry-after header if present
            retry_after = response.headers.get("retry-after")
            if retry_after:
                try:
                    wait_seconds = float(retry_after)
                    raise RateLimitError(f"Rate limit exceeded, retry after {wait_seconds}s")
                except ValueError:
                    pass
            raise RateLimitError("Rate limit exceeded")
        
        response.raise_for_status()
        return response
    
    # Text-to-3D endpoints
    
    def create_text_to_3d(self, request: Text3DRequest) -> str:
        """Create text-to-3D task. Returns task_id"""
        response = self._request(
            "POST",
            "text-to-3d",
            json=request.model_dump(exclude_none=True)
        )
        data = response.json()
        return data.get("result")
    
    def get_text_to_3d(self, task_id: str) -> Text3DResult:
        """Get text-to-3D task status"""
        response = self._request("GET", f"text-to-3d/{task_id}")
        return Text3DResult(**response.json())
    
    # Text-to-Texture endpoints
    
    def create_text_to_texture(self, request: TextTextureRequest) -> str:
        """Create text-to-texture task. Returns task_id"""
        response = self._request(
            "POST",
            "text-to-texture",
            json=request.model_dump(exclude_none=True)
        )
        data = response.json()
        return data.get("result")
    
    def get_text_to_texture(self, task_id: str) -> TextTextureResult:
        """Get text-to-texture task status"""
        response = self._request("GET", f"text-to-texture/{task_id}")
        return TextTextureResult(**response.json())
    
    # Image-to-3D endpoints
    
    def create_image_to_3d(self, request: Image3DRequest) -> str:
        """Create image-to-3D task. Returns task_id"""
        response = self._request(
            "POST",
            "image-to-3d",
            json=request.model_dump(exclude_none=True)
        )
        data = response.json()
        return data.get("result")
    
    def get_image_to_3d(self, task_id: str) -> Image3DResult:
        """Get image-to-3D task status"""
        response = self._request("GET", f"image-to-3d/{task_id}")
        return Image3DResult(**response.json())
    
    # Rigging endpoints
    
    def create_rigging(self, request: RiggingRequest) -> str:
        """Create rigging task. Returns task_id"""
        # Use v1 for rigging endpoint
        url = f"{self.BASE_URL}/openapi/v1/rigging"
        response = self.client.request(
            "POST",
            url,
            headers=self._headers(),
            json=request.model_dump(exclude_none=True)
        )
        if response.status_code == 429:
            raise RateLimitError("Rate limit exceeded")
        response.raise_for_status()
        data = response.json()
        return data.get("result")
    
    def get_rigging(self, task_id: str) -> RiggingResult:
        """Get rigging task status"""
        url = f"{self.BASE_URL}/openapi/v1/rigging/{task_id}"
        response = self.client.request("GET", url, headers=self._headers())
        response.raise_for_status()
        return RiggingResult(**response.json())
    
    # Animation endpoints
    
    def create_animation(self, request: AnimationRequest) -> str:
        """Create animation task. Returns task_id"""
        url = f"{self.BASE_URL}/openapi/v1/animations"
        response = self.client.request(
            "POST",
            url,
            headers=self._headers(),
            json=request.model_dump(exclude_none=True)
        )
        if response.status_code == 429:
            raise RateLimitError("Rate limit exceeded")
        response.raise_for_status()
        data = response.json()
        return data.get("result")
    
    def get_animation(self, task_id: str) -> AnimationResult:
        """Get animation task status"""
        url = f"{self.BASE_URL}/openapi/v1/animations/{task_id}"
        response = self.client.request("GET", url, headers=self._headers())
        response.raise_for_status()
        return AnimationResult(**response.json())
    
    # Retexture endpoints
    
    def create_retexture(self, request: RetextureRequest) -> str:
        """Create retexture task. Returns task_id"""
        url = f"{self.BASE_URL}/openapi/v1/retexture"
        response = self.client.request(
            "POST",
            url,
            headers=self._headers(),
            json=request.model_dump(exclude_none=True)
        )
        if response.status_code == 429:
            raise RateLimitError("Rate limit exceeded")
        response.raise_for_status()
        data = response.json()
        return data.get("result")
    
    def get_retexture(self, task_id: str) -> RetextureResult:
        """Get retexture task status"""
        url = f"{self.BASE_URL}/openapi/v1/retexture/{task_id}"
        response = self.client.request("GET", url, headers=self._headers())
        response.raise_for_status()
        return RetextureResult(**response.json())
    
    # Polling helpers
    
    def poll_until_complete(
        self,
        task_id: str,
        task_type: str = "text-to-3d",
        poll_interval: float = 5.0,
        max_wait: float = 600.0
    ) -> Union[Text3DResult, TextTextureResult, Image3DResult, RiggingResult, AnimationResult, RetextureResult]:
        """Poll task until complete or timeout"""
        start_time = time.time()
        
        get_func = {
            "text-to-3d": self.get_text_to_3d,
            "text-to-texture": self.get_text_to_texture,
            "image-to-3d": self.get_image_to_3d,
            "rigging": self.get_rigging,
            "animation": self.get_animation,
            "retexture": self.get_retexture,
        }.get(task_type)
        
        if not get_func:
            raise ValueError(f"Unknown task type: {task_type}")
        
        while True:
            result = get_func(task_id)
            
            if result.status == TaskStatus.SUCCEEDED:
                return result
            elif result.status == TaskStatus.FAILED:
                error_msg = getattr(result, 'error', None) or \
                           (result.task_error.get('message') if result.task_error else "Unknown error")
                raise RuntimeError(f"Task failed: {error_msg}")
            elif result.status == TaskStatus.EXPIRED:
                raise RuntimeError("Task expired")
            
            elapsed = time.time() - start_time
            if elapsed > max_wait:
                raise TimeoutError(f"Task timed out after {max_wait}s")
            
            time.sleep(poll_interval)
    
    def download_file(self, url: str, output_path: str) -> int:
        """Download file from URL. Returns file size in bytes"""
        response = httpx.get(url)
        response.raise_for_status()
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        return len(response.content)
    
    def close(self):
        """Close HTTP clients"""
        self.client.close()
        self.async_client.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        self.close()
