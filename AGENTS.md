# Agent Instructions and Repository Guide

This document provides context and instructions for AI agents (Jules, Gemini, Claude, Copilot, etc.) working on this repository.

## Repository Overview
This project is a personal analytics dashboard hosted on **Cloudflare Pages** with a **Cloudflare Worker** backend.
- **Frontend:** Static HTML/JS/CSS in the root directory. content is served via Cloudflare Pages.
- **Backend:** `Cloudflare_Workers/` contains the Worker code handling API requests and security.
- **Data Pipeline:** `scripts/generate_dashboard.py` generates data and visualizations, run daily via GitHub Actions.

## Key Technologies
- **Frontend:** HTML5, Bootstrap 5, Chart.js, marked.js, DOMPurify.
- **Backend:** Cloudflare Workers (JavaScript/ESM).
- **Data Science:** Python 3.12, Pandas, Plotly.
- **CI/CD:** GitHub Actions.

## Development Guidelines

### 1. Security
- **CORS:** The Cloudflare Worker implements strict CORS policies. Always verify changes using `tests/test_cors.mjs`.
- **Secrets:** Do not hardcode secrets. Use GitHub Secrets (`CLOUDFLARE_API_TOKEN`, etc.) and `wrangler.toml` for bindings.
- **Sanitization:** Always use `DOMPurify` when rendering Markdown or user content in the frontend.

### 2. Testing
- **Worker Tests:** Run `node --test tests/test_cors.mjs` to verify worker logic and CORS policies.
- **Frontend Verification:** Ensure `aria-label` attributes are preserved for accessibility.

### 3. Deployment
- **Cloudflare Pages:** Deployed automatically on push to `main` via `.github/workflows/deploy.yml`.
- **Cloudflare Workers:** Deployed via the same workflow using `wrangler-action`.

## Tool Integration
- **GitKraken:** This repository is optimized for GitKraken. We recommend using GitKraken for visual commit history and branch management.
- **GitHub Copilot:** See `.github/copilot-instructions.md` for specific coding assistance guidelines.

## Directory Structure
- `.github/`: CI/CD workflows.
- `Cloudflare_Workers/`: Worker code and configuration.
- `assets/`: Static assets (JS, CSS, Data).
- `scripts/`: Python scripts for data generation.
- `tests/`: Node.js test files.
