#!/bin/bash

# Conductor Workspace Setup Script for sounds-good
# This script prepares a new Conductor workspace with all necessary configuration
# Run this after creating a new workspace to sync envs, configs, and install deps

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROOT_DIR="/Users/periperi/sounds-good"
WORKSPACE_DIR="$(pwd)"

echo -e "${BLUE}🎵 Conductor Workspace Setup - sounds-good${NC}"
echo "================================================"
echo -e "Root directory:      ${ROOT_DIR}"
echo -e "Workspace directory: ${WORKSPACE_DIR}"
echo ""

# Function to copy file if source exists
copy_if_exists() {
    local src="$1"
    local dest="$2"
    local name="$3"

    if [ -f "$src" ]; then
        cp "$src" "$dest"
        echo -e "${GREEN}✓${NC} Copied ${name}"
        return 0
    else
        echo -e "${YELLOW}⊘${NC} ${name} not found in root, skipping"
        return 1
    fi
}

# Function to copy directory if source exists
copy_dir_if_exists() {
    local src="$1"
    local dest="$2"
    local name="$3"

    if [ -d "$src" ]; then
        mkdir -p "$dest"
        cp -r "$src"/* "$dest"/ 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Copied ${name}"
        return 0
    else
        echo -e "${YELLOW}⊘${NC} ${name} not found in root, skipping"
        return 1
    fi
}

# -----------------------------------
# Step 1: Copy environment files
# -----------------------------------
echo -e "\n${BLUE}Step 1: Environment Files${NC}"
echo "-----------------------------------"

# Copy all .env* files from root
env_files_copied=0
for env_file in "${ROOT_DIR}"/.env*; do
    if [ -f "$env_file" ]; then
        filename=$(basename "$env_file")
        # Skip .env.example or .env.template if you want to create those
        cp "$env_file" "${WORKSPACE_DIR}/${filename}"
        echo -e "${GREEN}✓${NC} Copied ${filename}"
        ((env_files_copied++))
    fi
done

if [ $env_files_copied -eq 0 ]; then
    echo -e "${YELLOW}⊘${NC} No .env files found in root directory"
    echo -e "  Tip: Create .env or .env.local in ${ROOT_DIR} to have them synced"
fi

# -----------------------------------
# Step 2: Copy Claude configuration
# -----------------------------------
echo -e "\n${BLUE}Step 2: Claude Configuration${NC}"
echo "-----------------------------------"

# Create .claude directory if it doesn't exist
mkdir -p "${WORKSPACE_DIR}/.claude"

# Copy settings.local.json
copy_if_exists \
    "${ROOT_DIR}/.claude/settings.local.json" \
    "${WORKSPACE_DIR}/.claude/settings.local.json" \
    ".claude/settings.local.json"

# Copy skills directory
if [ -d "${ROOT_DIR}/.claude/skills" ]; then
    mkdir -p "${WORKSPACE_DIR}/.claude/skills"
    cp -r "${ROOT_DIR}/.claude/skills"/* "${WORKSPACE_DIR}/.claude/skills"/ 2>/dev/null || true
    skill_count=$(find "${WORKSPACE_DIR}/.claude/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
    echo -e "${GREEN}✓${NC} Copied ${skill_count} skills"
else
    echo -e "${YELLOW}⊘${NC} No skills directory found"
fi

# -----------------------------------
# Step 3: Install dependencies
# -----------------------------------
echo -e "\n${BLUE}Step 3: Dependencies${NC}"
echo "-----------------------------------"

# Check if node_modules exists and is up to date
if [ -d "${WORKSPACE_DIR}/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"

    # Check if pnpm-lock.yaml is newer than node_modules
    if [ "${WORKSPACE_DIR}/pnpm-lock.yaml" -nt "${WORKSPACE_DIR}/node_modules" ]; then
        echo -e "${YELLOW}!${NC} pnpm-lock.yaml is newer, updating dependencies..."
        pnpm install
        echo -e "${GREEN}✓${NC} Dependencies updated"
    else
        echo -e "${GREEN}✓${NC} Dependencies up to date"
    fi
else
    echo -e "${YELLOW}!${NC} Installing dependencies..."
    pnpm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
fi

# -----------------------------------
# Step 4: Verify build (optional)
# -----------------------------------
echo -e "\n${BLUE}Step 4: Verification${NC}"
echo "-----------------------------------"

# Type check without building
if command -v npx &> /dev/null; then
    echo "Running TypeScript check..."
    if npx tsc --noEmit 2>/dev/null; then
        echo -e "${GREEN}✓${NC} TypeScript check passed"
    else
        echo -e "${YELLOW}!${NC} TypeScript errors found (run 'pnpm build' to see details)"
    fi
fi

# -----------------------------------
# Step 5: Create .context directory
# -----------------------------------
echo -e "\n${BLUE}Step 5: Workspace Context${NC}"
echo "-----------------------------------"

mkdir -p "${WORKSPACE_DIR}/.context"

if [ ! -f "${WORKSPACE_DIR}/.context/notes.md" ]; then
    cat > "${WORKSPACE_DIR}/.context/notes.md" << 'EOF'
# Workspace Notes

This file is for capturing context and notes during development.

## Quick Reference

- **Dev server**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`

## Session Notes

EOF
    echo -e "${GREEN}✓${NC} Created .context/notes.md"
else
    echo -e "${GREEN}✓${NC} .context/notes.md exists"
fi

if [ ! -f "${WORKSPACE_DIR}/.context/todos.md" ]; then
    cat > "${WORKSPACE_DIR}/.context/todos.md" << 'EOF'
# Workspace Todos

Track tasks for this workspace here.

## Current

- [ ] Setup complete, ready to work

## Done

EOF
    echo -e "${GREEN}✓${NC} Created .context/todos.md"
else
    echo -e "${GREEN}✓${NC} .context/todos.md exists"
fi

# -----------------------------------
# Summary
# -----------------------------------
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "  • Start dev server:  pnpm dev"
echo "  • Build project:     pnpm build"
echo "  • Run linter:        pnpm lint"
echo ""
echo -e "Happy coding! 🎹"
