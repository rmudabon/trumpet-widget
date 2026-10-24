FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.9.5 /uv /uvx /bin/
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_LINK_MODE=copy \
    PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY . .
RUN if [ -f uv.lock ]; then uv sync --frozen --no-install-project; else uv sync --no-install-project; fi
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"]
