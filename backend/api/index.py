"""Vercel serverless entrypoint. Vercel's Python runtime auto-detects the
`app` ASGI callable in any file under api/ and wraps it as a function."""

from app.main import app
