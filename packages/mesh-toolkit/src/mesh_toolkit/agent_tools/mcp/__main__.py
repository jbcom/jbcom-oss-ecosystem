"""Run the mesh-toolkit MCP server.

Usage:
    python -m mesh_toolkit.agent_tools.mcp

Environment:
    MESHY_API_KEY - Required for API access
"""

import os
import sys


def main():
    # Check for API key
    if not os.environ.get("MESHY_API_KEY"):
        print("Warning: MESHY_API_KEY not set. Some tools will fail.", file=sys.stderr)
    
    from mesh_toolkit.agent_tools.mcp import run_server
    
    print("Starting mesh-toolkit MCP server...", file=sys.stderr)
    run_server()


if __name__ == "__main__":
    main()
