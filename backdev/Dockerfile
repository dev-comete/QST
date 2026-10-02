# Use official lightweight Python image
FROM python:3.12-slim

# Set environment variables to prevent Python from writing .pyc files 
# and to ensure console output isn't buffered
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required for psycopg2 (PostgreSQL)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Django project code
COPY . /app/

# Make the script executable
RUN chmod +x /app/entrypoint.sh

# Expose the port Django runs on
EXPOSE 8000

# Set the entrypoint
ENTRYPOINT ["bash", "/app/entrypoint.sh"]

# Default command to run when the container starts
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]