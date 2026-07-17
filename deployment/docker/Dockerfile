# -----------------------------
# Base Image
# -----------------------------
FROM python:3.11-slim

# -----------------------------
# Working Directory
# -----------------------------
WORKDIR /app

# -----------------------------
# Environment Variables
# -----------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# -----------------------------
# Install System Packages
# -----------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Copy Requirements
# -----------------------------
COPY requirements/api.txt .

# -----------------------------
# Install Python Packages
# -----------------------------
RUN pip install --no-cache-dir -r requirements/api.txt

# -----------------------------
# Copy Project
# -----------------------------
COPY . .

# -----------------------------
# Expose FastAPI Port
# -----------------------------
EXPOSE 8000

# -----------------------------
# Start API
# -----------------------------
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000"]