#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e 

echo "Applying database migrations..."
python manage.py migrate

echo "Starting the Django server..."
# This executes the CMD passed from the Dockerfile
exec "$@"