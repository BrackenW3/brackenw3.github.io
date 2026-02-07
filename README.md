# Bracken Analytics & Dashboard

This repository hosts a personal dashboard and portfolio site, deployed to **Cloudflare Pages** and **Cloudflare Workers**. It features automated data pipelines and integration examples for Python-based tools.

## Deployment

### Cloudflare Deployment
The site is automatically deployed to Cloudflare via GitHub Actions (`.github/workflows/deploy.yml`).
- **Frontend (Pages):** Static HTML/JS files are deployed to Cloudflare Pages.
- **Backend (Workers):** The `Cloudflare_Workers/` directory is deployed as a Cloudflare Worker.

**Setup Required:**

#### Required Secrets
Add these secrets in your repository settings (Settings > Secrets and variables > Actions > Secrets):

1. **CLOUDFLARE_API_TOKEN** - Required for both Workers and Pages deployment
   - Go to Cloudflare Dashboard > My Profile > API Tokens > Create Token
   - Use the "Edit Cloudflare Workers" template OR create a custom token with:
     - Account: Cloudflare Workers Scripts - Edit
     - Account: Cloudflare Pages - Edit
   - Copy the token and add it as a repository secret

2. **CLOUDFLARE_ACCOUNT_ID** - Required for both Workers and Pages deployment
   - Found in your Cloudflare Dashboard URL: `https://dash.cloudflare.com/{ACCOUNT_ID}`
   - Or in any domain overview page under "Account ID" on the right sidebar
   - Add it as a repository secret

#### Required Variables
Add these variables in your repository settings (Settings > Secrets and variables > Actions > Variables):

1. **CLOUDFLARE_PAGES_PROJECT_NAME** - Required for Pages deployment only
   - The name of your Cloudflare Pages project
   - If you don't have one yet:
     - Go to Cloudflare Dashboard > Pages > Create a project
     - Use "Direct Upload" method and note the project name
   - Add the project name as a repository variable
   - **Note:** Worker deployment works independently and doesn't require this

#### Optional Secrets (for advanced workflows)

3. **PAT_TOKEN** - Required only for `dispatch-update.yml` workflow
   - A GitHub Personal Access Token with `repo` scope
   - Only needed if you want to trigger workflows in other repositories
   - GitHub Settings > Developer settings > Personal access tokens > Generate new token
   - Grant `repo` scope and add as repository secret

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
