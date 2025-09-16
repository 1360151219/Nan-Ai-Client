# syntax=docker/dockerfile:1

# --- Base Stage ---
# Use an official Python runtime as a parent image.
# Using a slim version to keep the image size down.
FROM python:3.12-slim as base

# Set environment variables for Python.
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing .pyc files.
# PYTHONUNBUFFERED: Ensures that Python output is sent straight to the terminal without being buffered first.
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container.
WORKDIR /app


# --- Builder Stage ---
# This stage is for installing dependencies.
FROM base as builder

# Install uv, the fast Python package installer used in this project.
RUN pip install uv

# Copy the dependency definition files.
COPY pyproject.toml uv.lock* ./

# Install project dependencies using uv.
# --no-cache is used to reduce image size.
# `uv pip sync` is used to install exact versions from the lock file, ensuring reproducibility.
RUN uv pip sync --no-cache


# --- Final Stage ---
# This is the final image that will be run.
FROM base as final

# Copy the installed dependencies from the builder stage.
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin/uv /usr/local/bin/uv

# Copy the application's source code.
COPY main.py .
COPY src/ ./src/

# Expose the port that the application runs on.
# This should match the port configured in main.py for uvicorn.
EXPOSE 8000

# The command to run the application when the container starts.
# It executes `python main.py`, which in turn starts the uvicorn server.
CMD ["python", "main.py"]