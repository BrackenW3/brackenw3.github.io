# Credentials & Configuration Guide

This document explains all the credentials and configuration needed for GitHub Actions workflows to deploy to Cloudflare.

## Overview

The repository uses GitHub Actions to automate deployments to Cloudflare Workers and Cloudflare Pages. Here's what you need to configure:

| Credential | Type | Required For | Status |
|-----------|------|--------------|---------|
| `CLOUDFLARE_API_TOKEN` | Secret | Workers & Pages deployment | ⚠️ **REQUIRED** |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Workers & Pages deployment | ⚠️ **REQUIRED** |
| `CLOUDFLARE_PAGES_PROJECT_NAME` | Variable | Pages deployment only | ⚠️ **REQUIRED for Pages** |
| `PAT_TOKEN` | Secret | Remote workflow dispatch | ℹ️ Optional |

## Step-by-Step Setup

### 1. Cloudflare API Token (REQUIRED)

This token allows GitHub Actions to deploy to both Cloudflare Workers and Pages.

**How to create:**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **My Profile** > **API Tokens** > **Create Token**
3. Choose **Edit Cloudflare Workers** template, OR create a custom token with these permissions:
   - **Account** > **Cloudflare Workers Scripts** > **Edit**
   - **Account** > **Cloudflare Pages** > **Edit**
4. Click **Continue to summary** > **Create Token**
5. **Copy the token** (you won't see it again!)

**How to add to GitHub:**
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions** > **Secrets**
3. Click **New repository secret**
4. Name: `CLOUDFLARE_API_TOKEN`
5. Paste the token value
6. Click **Add secret**

### 2. Cloudflare Account ID (REQUIRED)

Your Cloudflare account identifier.

**How to find:**
- **Option A:** Check your Cloudflare Dashboard URL when viewing any domain: `https://dash.cloudflare.com/{ACCOUNT_ID}/...`
- **Option B:** Open any domain in Cloudflare Dashboard, scroll down the right sidebar to find "Account ID"

**How to add to GitHub:**
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions** > **Secrets**
3. Click **New repository secret**
4. Name: `CLOUDFLARE_ACCOUNT_ID`
5. Paste your account ID
6. Click **Add secret**

### 3. Cloudflare Pages Project Name (REQUIRED for Pages deployment)

The name of your Cloudflare Pages project. Workers deployment works independently without this.

**If you don't have a Pages project yet:**
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** > **Create a project**
3. Choose **Direct Upload** (since we're using GitHub Actions to deploy)
4. Enter a project name (e.g., `brackenw3-dashboard`, `my-portfolio`, etc.)
5. Complete the setup
6. **Remember the project name** - you'll need it for GitHub

**How to add to GitHub:**
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions** > **Variables**
3. Click **New repository variable**
4. Name: `CLOUDFLARE_PAGES_PROJECT_NAME`
5. Value: Your Cloudflare Pages project name (e.g., `my-portfolio`, `my-analytics-dashboard`)
6. Click **Add variable**

**Why a variable instead of a secret?**
- Variables are for non-sensitive configuration values
- Project names are not secret and may appear in logs
- This makes the workflow more flexible and easier to debug

### 4. Personal Access Token (OPTIONAL)

Only required if you want to use the `dispatch-update.yml` workflow to trigger actions in other repositories.

**How to create:**
1. Go to GitHub **Settings** (your personal settings, not repository)
2. Navigate to **Developer settings** > **Personal access tokens** > **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Give it a descriptive note (e.g., "Workflow Dispatch Token")
5. Select the **repo** scope (full control of private repositories)
6. Click **Generate token**
7. **Copy the token** (you won't see it again!)

**How to add to GitHub:**
1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions** > **Secrets**
3. Click **New repository secret**
4. Name: `PAT_TOKEN`
5. Paste the token value
6. Click **Add secret**

## Verification

After setting up the credentials:

### Test Worker Deployment
1. Make a small change to any file in `Cloudflare_Workers/`
2. Commit and push to the `main` branch
3. Go to **Actions** tab in your repository
4. Watch the "Deploy to Cloudflare" workflow run
5. The "Deploy Worker" job should succeed

### Test Pages Deployment
1. Make a small change to any `.html` file or file in `assets/` or `dashboard_files/`
2. Commit and push to the `main` branch
3. Go to **Actions** tab in your repository
4. Watch the "Deploy to Cloudflare" workflow run
5. The "Deploy Pages" job should succeed (if `CLOUDFLARE_PAGES_PROJECT_NAME` is set)

### Test Manual Deployment
1. Go to **Actions** tab in your repository
2. Select "Deploy to Cloudflare" workflow
3. Click **Run workflow** > **Run workflow**
4. Both jobs should execute

## Troubleshooting

### "Cloudflare API returned non-200: 404 - Project not found"
- **Cause:** The `CLOUDFLARE_PAGES_PROJECT_NAME` variable is not set or contains an incorrect project name
- **Fix:** 
  1. Verify your Pages project exists in Cloudflare Dashboard
  2. Check the exact project name (it's case-sensitive)
  3. Set the `CLOUDFLARE_PAGES_PROJECT_NAME` variable with the correct name

### "Unauthorized" errors during deployment
- **Cause:** `CLOUDFLARE_API_TOKEN` is missing, incorrect, or lacks necessary permissions
- **Fix:**
  1. Verify the token has "Edit" permissions for both Workers and Pages
  2. Check the token hasn't expired
  3. Regenerate the token if needed and update the secret

### "Account not found" errors
- **Cause:** `CLOUDFLARE_ACCOUNT_ID` is incorrect
- **Fix:** Double-check your account ID from the Cloudflare Dashboard

### Worker deployment succeeds but Pages deployment is skipped
- **Status:** This is normal if `CLOUDFLARE_PAGES_PROJECT_NAME` is not configured
- **Info:** Worker deployment is independent and will work without Pages configuration
- **Fix:** If you want Pages deployment, set the `CLOUDFLARE_PAGES_PROJECT_NAME` variable

### "PAT_TOKEN secret not configured" in dispatch-update workflow
- **Status:** This is expected if you haven't set up cross-repository workflow triggers
- **Info:** This is an optional feature for advanced use cases
- **Fix:** Only set this up if you need to trigger workflows in other repositories

## Workflow-Specific Requirements

### deploy.yml (Deploy to Cloudflare)
- ✅ **Always runs:** Worker deployment
- ⚠️ **Requires setup for Pages:** Set `CLOUDFLARE_PAGES_PROJECT_NAME` variable
- **Secrets needed:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **Variables needed:** `CLOUDFLARE_PAGES_PROJECT_NAME` (for Pages only)

### daily-data-update.yml (Automated Data Updates)
- ✅ **No credentials needed** - Uses built-in `GITHUB_TOKEN`
- **Requirements:** Python 3.12 and dependencies in `requirements.txt`
- **Permissions:** Needs `contents: write` permission (already configured)

### dispatch-update.yml (Trigger Remote Workflows)
- ⚠️ **Optional workflow** - Only needed for advanced cross-repo automation
- **Secrets needed:** `PAT_TOKEN` (Personal Access Token with `repo` scope)
- **When to use:** Triggering workflows in other repositories you own

## Security Notes

- ⚠️ **Never commit secrets to your repository**
- ✅ Always use GitHub's Secrets feature for sensitive values
- ✅ Use Variables for non-sensitive configuration (like project names)
- 🔒 API tokens should have minimal required permissions
- 🔄 Rotate tokens periodically for better security
- 📝 Use descriptive names for tokens to track their usage

## Network & Firewall Configuration

### GitHub Actions and CloudFlare API Access

GitHub Actions runners need to communicate with CloudFlare's API endpoints. The workflows include:
- **Timeout protection**: Jobs timeout after 10 minutes, individual steps after 5 minutes
- **Automatic retries**: GitHub Actions automatically retries transient network failures
- **Explicit error handling**: Clear error messages for authentication and network issues

### Firewall Considerations

**For GitHub Enterprise users or self-hosted runners:**
If you use GitHub Enterprise with strict firewall rules or self-hosted runners, ensure outbound access to:
- `api.cloudflare.com` (port 443) - CloudFlare API
- `*.workers.dev` (port 443) - Workers deployment
- `*.pages.dev` (port 443) - Pages deployment

**For github.com users:**
GitHub-hosted runners have full internet access. No additional firewall configuration needed.

### Troubleshooting Network Issues

**Symptom: "Connection timeout" or "Network unreachable"**
- **Cause**: Firewall blocking CloudFlare API access
- **Solution**: 
  - Verify your organization's firewall allows HTTPS to `*.cloudflare.com`
  - Check if GitHub Actions is blocked by corporate proxy
  - Contact your network administrator to whitelist CloudFlare domains

**Symptom: "API returned 401 Unauthorized"**
- **Cause**: Invalid or expired API token
- **Solution**: Regenerate your CloudFlare API token and update the secret

**Symptom: Workflow times out without error**
- **Cause**: Network connectivity issues causing hangs
- **Solution**: The workflow now includes timeout-minutes configuration to fail fast
  - Job timeout: 10 minutes
  - Deployment step timeout: 5 minutes

## Need Help?

If you encounter issues:
1. Check the Actions logs for detailed error messages
2. Verify all credentials are correctly set in GitHub Settings
3. Ensure your Cloudflare account has the necessary permissions
4. Review the workflow files for any project-specific configuration needed
5. For network/firewall issues, check the "Network & Firewall Configuration" section above
