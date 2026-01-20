#!/bin/bash
# UniPivot Survey Automation Cron Script
# This script calls the survey automation API endpoint

# Load environment variables
set -a
source /var/www/unihome-v2/.env.production
set +a

# Configuration
API_URL="http://localhost:3000/api/cron/surveys"
LOG_FILE="/var/www/unihome-v2/logs/cron-surveys.log"

# Create log directory if not exists
mkdir -p /var/www/unihome-v2/logs

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Function to call API
call_api() {
    local action=$1
    local response

    log "Starting: $action"

    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $CRON_SECRET" \
        -d "{\"action\": \"$action\"}" \
        --max-time 60)

    if [ $? -eq 0 ]; then
        log "Completed: $action - Response: $response"
    else
        log "Failed: $action - Error calling API"
    fi
}

# Parse command line argument
ACTION=${1:-all}

case $ACTION in
    auto-create)
        call_api "auto-create"
        ;;
    reminders)
        call_api "reminders"
        ;;
    close-expired)
        call_api "close-expired"
        ;;
    book-report-reminders)
        call_api "book-report-reminders"
        ;;
    all)
        call_api "all"
        ;;
    *)
        echo "Usage: $0 {auto-create|reminders|close-expired|book-report-reminders|all}"
        exit 1
        ;;
esac

exit 0
