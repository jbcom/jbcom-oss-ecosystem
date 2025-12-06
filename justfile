# jbcom-oss-ecosystem justfile
# Run `just --list` to see all available recipes

# Default recipe shows help
default:
    @just --list

# ==============================================================================
# SETUP & DEVELOPMENT
# ==============================================================================

# Install all dependencies (Python + Node)
install: install-python install-node

# Install Python dependencies with uv
install-python:
    uv sync --all-packages

# Install Node dependencies with pnpm
install-node:
    pnpm install

# Full development setup (idempotent)
setup: install
    @echo "Development environment ready!"

# ==============================================================================
# OTTERFALL GAME DEVELOPMENT
# ==============================================================================

# Idempotent Otterfall development setup
develop-otterfall: install
    #!/usr/bin/env bash
    set -euo pipefail

    echo "Setting up Otterfall development environment..."

    # Ensure otterfall dependencies are installed
    cd packages/otterfall && pnpm install

    # Sync capacitor if needed
    if [ -d "android" ]; then
        echo "Syncing Capacitor..."
        pnpm run cap:sync || true
    fi

    echo "Otterfall ready! Run 'just otterfall-dev' to start."

# Start Otterfall dev server
otterfall-dev:
    cd packages/otterfall && pnpm run dev

# Build Otterfall
otterfall-build:
    cd packages/otterfall && pnpm run build

# Run Otterfall tests
otterfall-test:
    cd packages/otterfall && pnpm run test

# Run Otterfall e2e tests
otterfall-e2e:
    cd packages/otterfall && pnpm run test:e2e

# Build Android APK
otterfall-android:
    cd packages/otterfall && pnpm run build:android

# ==============================================================================
# CREWAI AGENTS (internal/crewai - package-agnostic engine)
# ==============================================================================

# List all packages with crews
crew-list:
    cd internal/crewai && uv run python -m crew_agents list

# List crews for a specific package
crew-list-pkg package:
    cd internal/crewai && uv run python -m crew_agents list {{package}}

# Run a crew (e.g., just crew-run otterfall game_builder --input "Create X")
crew-run package crew *args:
    cd internal/crewai && uv run python -m crew_agents run {{package}} {{crew}} {{args}}

# Show crew details
crew-info package crew:
    cd internal/crewai && uv run python -m crew_agents info {{package}} {{crew}}

# Run otterfall game_builder with Kiro tasks spec
crew-otterfall-build:
    cd internal/crewai && uv run python -m crew_agents run otterfall game_builder \
        --file ../../.kiro/specs/otterfall-complete/tasks.md

# Legacy: Run game builder with a spec (uses otterfall)
crew-build spec:
    cd internal/crewai && uv run python -m crew_agents build "{{spec}}"

# Test CrewAI file tools
crew-test-tools:
    cd internal/crewai && uv run python -m crew_agents test-tools

# ==============================================================================
# PYTHON PACKAGES
# ==============================================================================

# Run tests for all Python packages
test-python:
    uv run pytest packages/*/tests/ -v

# Run tests for a specific package
test-package package:
    uv run pytest packages/{{package}}/tests/ -v

# Type check all Python packages
typecheck:
    uv run mypy packages/*/src/

# Lint Python code
lint-python:
    uv run ruff check packages/

# Format Python code
format-python:
    uv run ruff format packages/

# ==============================================================================
# MONOREPO MANAGEMENT
# ==============================================================================

# Clean all build artifacts
clean:
    rm -rf .venv
    rm -rf packages/*/dist
    rm -rf packages/*/.pytest_cache
    rm -rf packages/*/__pycache__
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true

# Clean and reinstall everything
rebuild: clean install

# Check all packages (lint + typecheck + test)
check: lint-python typecheck test-python
    @echo "All checks passed!"

# ==============================================================================
# GIT WORKFLOWS
# ==============================================================================

# Create a conventional commit
commit message:
    git add . && git commit -m "{{message}}"

# Push current branch
push:
    git push -u origin $(git branch --show-current)

# ==============================================================================
# UTILITY RECIPES
# ==============================================================================

# Show Python package versions
versions:
    @echo "Python packages:"
    @uv pip list | grep -E "^(extended-data-types|lifecyclelogging|directed-inputs-class|vendor-connectors|python-terraform-bridge)" || echo "  (none installed)"

# Open documentation
docs:
    @echo "Opening docs..."
    @open docs/ 2>/dev/null || xdg-open docs/ 2>/dev/null || echo "Could not open docs"
