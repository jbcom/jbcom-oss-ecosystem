"""Utilities for spec hashing and canonicalization"""
import json
import hashlib
from typing import Dict, Any


def canonicalize_spec(spec: Dict[str, Any]) -> str:
    """Convert asset spec to canonical JSON string for hashing
    
    Args:
        spec: Asset specification dict
    
    Returns:
        Canonical JSON string (sorted keys, no whitespace)
    """
    return json.dumps(spec, sort_keys=True, separators=(',', ':'))


def compute_spec_hash(spec: Dict[str, Any], length: int = 12) -> str:
    """Compute truncated SHA256 hash of asset spec
    
    Args:
        spec: Asset specification dict
        length: Hash length (default 12 chars)
    
    Returns:
        Truncated hex hash safe for filenames
    """
    canonical = canonicalize_spec(spec)
    full_hash = hashlib.sha256(canonical.encode('utf-8')).hexdigest()
    return full_hash[:length]
