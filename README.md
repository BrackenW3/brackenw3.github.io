# Bracken Analytics & Dashboard

This repository hosts a personal dashboard and portfolio site, deployed to **Cloudflare Pages** and **Cloudflare Workers**. It features automated data pipelines and integration examples for Python-based tools.

## Deployment

### Cloudflare Deployment
The site is automatically deployed to Cloudflare via GitHub Actions (`.github/workflows/deploy.yml`).
- **Frontend (Pages):** Static HTML/JS files are deployed to Cloudflare Pages.
- **Backend (Workers):** The `Cloudflare_Workers/` directory is deployed as a Cloudflare Worker.

**Setup Required:**
1.  Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to your Repository Secrets.
2.  Update `projectName` in `.github/workflows/deploy.yml` to match your Cloudflare Pages project name.

## Workflows

### 1. Automated Data Updates
- **Workflow:** `.github/workflows/daily-data-update.yml`
- **Schedule:** Runs daily at midnight UTC.
- **Function:** Executes `scripts/generate_dashboard.py` to:
    - Update `assets/data/data.json` with a timestamp.
    - Generate a new Plotly chart at `dashboard_files/plotly_chart.html`.
    - Commits the changes back to the repository.

### 2. Remote Repository Integration
- **Workflow:** `.github/workflows/dispatch-update.yml`
- **Trigger:** Manual (`workflow_dispatch`).
- **Function:** Triggers a `repository_dispatch` event in another repository. Useful for coordinating deployments or updates across multiple projects.
- **Secret:** Requires a `PAT_TOKEN` (Personal Access Token) with `repo` scope in secrets.

## Python Integration Examples

This repository demonstrates how to integrate Python data science tools into a web environment.

- **Streamlit:** See `examples/streamlit/` for a sample app and deployment instructions.
- **Pyodide:** See `examples/pyodide/demo.html` for running Python directly in the browser (Client-side).
- **Automated Reporting:** The `scripts/generate_dashboard.py` script shows how to generate static HTML reports from Python scripts running in CI/CD.

## Local Development

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Run Data Generation:**
    ```bash
    python scripts/generate_dashboard.py
    ```
3.  **View Site:**
    Open `index.html` or `data-visualization.html` in your browser.

## GitKraken Integration

This repository is optimized for [GitKraken](https://www.gitkraken.com/), a powerful Git GUI. We recommend using GitKraken for:
- Visualizing commit history and branch merges.
- Managing complex merge conflicts.
- Creating and reviewing Pull Requests directly.

To get started, simply open this repository folder in GitKraken.
