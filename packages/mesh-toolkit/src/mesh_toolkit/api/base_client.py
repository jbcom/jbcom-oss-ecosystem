"""Base HTTP client with retry/rate-limit logic."""

import os
import time

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential


class RateLimitError(Exception):
    """Raised when API rate limit is hit."""

    pass


class BaseHttpClient:
    """Shared HTTP client with rate limiting and retries."""

    BASE_URL = "https://api.meshy.ai"

    def __init__(
        self, api_key: str | None = None, timeout: float = 300.0, min_request_interval: float = 0.5
    ):
        self.api_key = api_key or os.getenv("MESHY_API_KEY")
        if not self.api_key:
            msg = "MESHY_API_KEY not set"
            raise ValueError(msg)

        self.timeout = timeout
        self.client = httpx.Client(timeout=timeout)

        # Rate limiting state
        self.last_request_time = 0
        self.min_request_interval = min_request_interval

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    def _rate_limit(self):
        """Simple rate limiting."""
        now = time.time()
        time_since_last = now - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()

    @retry(
        retry=retry_if_exception_type((RateLimitError, httpx.TimeoutException)),
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=30),
    )
    def request(
        self, method: str, endpoint: str, api_version: str = "v2", **kwargs
    ) -> httpx.Response:
        """Make HTTP request with retries."""
        self._rate_limit()

        url = f"{self.BASE_URL}/openapi/{api_version}/{endpoint}"
        response = self.client.request(method, url, headers=self._headers(), **kwargs)

        # Handle rate limiting with Retry-After
        if response.status_code == 429:
            retry_after = response.headers.get("retry-after", "5")
            try:
                wait_seconds = float(retry_after)
                # Sleep for Retry-After duration before raising
                time.sleep(wait_seconds)
            except ValueError:
                time.sleep(5)  # Default to 5s if header invalid
            msg = f"Rate limit exceeded, waited {retry_after}s"
            raise RateLimitError(msg)

        # Retry on 5xx errors
        if response.status_code >= 500:
            msg = f"Server error {response.status_code}, retrying"
            raise RateLimitError(msg)

        # Don't retry 4xx errors (bad request, auth, etc)
        response.raise_for_status()
        return response

    def download_file(self, url: str, output_path: str) -> int:
        """Download file from URL using streaming. Returns file size in bytes."""
        # Handle case where output_path has no directory component
        dirname = os.path.dirname(output_path)
        if dirname:
            os.makedirs(dirname, exist_ok=True)

        total_bytes = 0
        with self.client.stream("GET", url) as response:
            response.raise_for_status()
            with open(output_path, "wb") as f:
                for chunk in response.iter_bytes(chunk_size=8192):
                    f.write(chunk)
                    total_bytes += len(chunk)

        return total_bytes

    def close(self):
        """Close HTTP client."""
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
