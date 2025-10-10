FROM ghcr.io/astral-sh/uv:python3.12-bookworm

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Install system dependencies including libpq
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
    
WORKDIR /app

# 设置uv和pip的国内镜像源
RUN mkdir -p /root/.config/uv && \ 
    echo '[sources]\npypi = "https://pypi.tuna.tsinghua.edu.cn/simple"' > /root/.config/uv/uv.toml && \ 
    pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple || true

# Pre-cache the application dependencies with increased timeout
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    UV_HTTP_TIMEOUT=120 uv sync --locked --no-install-project

# Copy the application into the container.
COPY . /app

# Install the application dependencies with increased timeout
RUN --mount=type=cache,target=/root/.cache/uv \
    UV_HTTP_TIMEOUT=120 uv sync --locked

EXPOSE 8000

# Run the application.
CMD ["uv", "run", "python", "main.py"]