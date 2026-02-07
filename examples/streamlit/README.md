# Streamlit Example App

This is a simple Streamlit application integrated into this repository as an example of how to manage Python apps alongside your other projects.

## Hosting on Streamlit Community Cloud

Since Cloudflare Workers/Pages acts as a static site host (or serverless functions), it does not support long-running Python processes like Streamlit directly. The recommended way to host this is using [Streamlit Community Cloud](https://streamlit.io/cloud), which is free for public repositories.

### Steps to Deploy:
1.  Ensure this repository is pushed to GitHub.
2.  Sign in to [Streamlit Community Cloud](https://share.streamlit.io/).
3.  Click "New app".
4.  Select this repository, the branch (`main`), and the file path `examples/streamlit/app.py`.
5.  Click "Deploy".

Your app will be live at `https://<your-username>-<repo-name>-<branch>-examples-streamlit-app-<hash>.streamlit.app`.

## Hosting on Other Platforms (Docker)

You can also deploy this using Docker to platforms like Fly.io, Railway, or Render. Create a `Dockerfile` in this directory:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8501

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```
