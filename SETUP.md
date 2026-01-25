# Cloudflare + GitHub Pages Setup Guide

This guide outlines the best practices for hosting your GitHub Pages site (`brackenw3.github.io`) using a custom domain (`willbracken.com`) managed by Cloudflare.

## 1. GitHub Repository Configuration
- Ensure your repository is named `brackenw3.github.io`.
- In **Settings > Pages > Custom domain**, ensure `willbracken.com` is entered and verified.
- Check **Enforce HTTPS**.

## 2. Cloudflare DNS Configuration
You need to configure your DNS records in Cloudflare to point to GitHub Pages.

### A Records (Root Domain)
Add the following `A` records for `willbracken.com` (@):

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Ensure the **Proxy status** is set to **Proxied** (Orange Cloud) to benefit from Cloudflare's CDN and security.

### CNAME Record (www subdomain)
If you want `www.willbracken.com` to work:
- Type: `CNAME`
- Name: `www`
- Target: `brackenw3.github.io`
- Proxy status: **Proxied** (Orange Cloud)

## 3. Cloudflare SSL/TLS Settings
To avoid "Too many redirects" errors or security issues:

1.  Go to **SSL/TLS > Overview** in Cloudflare.
2.  Set the encryption mode to **Full** or **Full (Strict)**.
    - **Full (Strict)** is recommended as GitHub Pages automatically generates a valid SSL certificate for your custom domain.
    - **Flexible** is **NOT** recommended as it often causes redirect loops with GitHub's HTTPS enforcement.

## 4. Page Rules (Optional but Recommended)
To ensure all traffic goes to the preferred version (e.g., forcing `www` or non-`www`):
- Go to **Rules > Page Rules**.
- Create a rule to forward `www.willbracken.com/*` to `https://willbracken.com/$1` using a **301 Permanent Redirect**, or vice versa depending on your preference.
