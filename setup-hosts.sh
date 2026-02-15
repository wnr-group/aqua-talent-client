#!/bin/bash

# Setup script for AquaTalentz local development domains
# This script adds the required entries to /etc/hosts

HOSTS_FILE="/etc/hosts"
DOMAINS=(
    "127.0.0.1 aquatalent.local"
    "127.0.0.1 company.aquatalent.local"
    "127.0.0.1 admin.aquatalent.local"
)

echo "AquaTalentz Domain Setup"
echo "========================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "This script requires sudo privileges to modify /etc/hosts"
    echo "Please run: sudo ./setup-hosts.sh"
    exit 1
fi

# Check and add each domain
for domain in "${DOMAINS[@]}"; do
    hostname=$(echo "$domain" | awk '{print $2}')
    if grep -q "$hostname" "$HOSTS_FILE"; then
        echo "[OK] $hostname already exists in $HOSTS_FILE"
    else
        echo "$domain" >> "$HOSTS_FILE"
        echo "[ADDED] $hostname added to $HOSTS_FILE"
    fi
done

echo ""
echo "Setup complete! You can now access:"
echo "  - Student Portal: http://aquatalent.local"
echo "  - Company Portal: http://company.aquatalent.local"
echo "  - Admin Portal:   http://admin.aquatalent.local"
echo ""
echo "To start the application, run:"
echo "  docker-compose up -d --build"
