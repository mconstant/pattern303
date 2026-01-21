#!/bin/sh

# Create an .env file from all environment variables starting with VITE_
printenv | grep '^VITE_' > /usr/share/nginx/html/.env

# Start nginx in the background
nginx -g "daemon off;" &