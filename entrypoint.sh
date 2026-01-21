#!/bin/sh

# Create an .env file from all environment variables starting with VITE_
env | grep '^VITE_' > /usr/share/nginx/html/.env

# Start nginx
nginx -g "daemon off;"