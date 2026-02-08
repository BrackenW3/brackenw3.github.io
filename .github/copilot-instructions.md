# GitHub Copilot Instructions

## Project Context
This is a personal dashboard built with **Cloudflare Pages** (frontend) and **Cloudflare Workers** (backend), using **Python** for data processing.

## Tech Stack
- **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript (ES6+ Modules).
- **Backend:** Cloudflare Workers (Service Worker API, fetch API).
- **Data:** Python 3.12 (Pandas, Plotly, PyGWalker).
- **Testing:** Node.js `node:test` runner.

## Coding Standards

### JavaScript (Frontend & Worker)
- Use `const` and `let` (no `var`).
- Prefer async/await over raw Promises.
- Ensure strict type checking where possible (or JSDoc comments).
- **Security:** Always sanitize HTML input using `DOMPurify` before inserting into the DOM.
- **Accessibility:** Always include `aria-label` attributes on interactive elements, especially those with icons only.

### Python
- Follow PEP 8 guidelines.
- Use type hints (`def func(a: int) -> str:`).
- Handle exceptions gracefully, especially file I/O and network requests.

### Cloudflare Workers
- Implement strict CORS policies (whitelist origins).
- Use `wrangler.toml` for configuration.
- Do not expose sensitive data in logs.

## Testing
- When suggesting changes to `Cloudflare_Workers/worker.js`, always verify or update `tests/test_cors.mjs`.
- Run tests with `node --test tests/test_cors.mjs`.
