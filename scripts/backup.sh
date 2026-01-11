#!/bin/bash

# UniPivot Backup Script
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/unipivot"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/var/www/unihome-v2"
DB_FILE="$PROJECT_DIR/prisma/data/unipivot.db"
RETENTION_DAYS=30

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== UniPivot Backup ===${NC}"
echo "Date: $DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
if [ -f "$DB_FILE" ]; then
    echo -e "${YELLOW}Backing up database...${NC}"
    sqlite3 "$DB_FILE" ".backup '$BACKUP_DIR/db_$DATE.sqlite'"
    echo -e "${GREEN}Database backup complete${NC}"
else
    echo -e "${RED}Database file not found!${NC}"
fi

# Backup uploads
if [ -d "$PROJECT_DIR/uploads" ]; then
    echo -e "${YELLOW}Backing up uploads...${NC}"
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C "$PROJECT_DIR" uploads
    echo -e "${GREEN}Uploads backup complete${NC}"
fi

# Backup .env file
if [ -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}Backing up environment...${NC}"
    cp "$PROJECT_DIR/.env" "$BACKUP_DIR/env_$DATE"
    echo -e "${GREEN}Environment backup complete${NC}"
fi

# Create combined backup
echo -e "${YELLOW}Creating combined backup...${NC}"
tar -czf "$BACKUP_DIR/unipivot_$DATE.tar.gz" \
    "$BACKUP_DIR/db_$DATE.sqlite" \
    "$BACKUP_DIR/uploads_$DATE.tar.gz" \
    "$BACKUP_DIR/env_$DATE" 2>/dev/null || true

# Clean up individual files
rm -f "$BACKUP_DIR/db_$DATE.sqlite"
rm -f "$BACKUP_DIR/uploads_$DATE.tar.gz"
rm -f "$BACKUP_DIR/env_$DATE"

# Remove old backups
echo -e "${YELLOW}Cleaning old backups...${NC}"
find "$BACKUP_DIR" -name "unipivot_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# List backups
echo -e "${GREEN}=== Backup Complete ===${NC}"
echo "Location: $BACKUP_DIR/unipivot_$DATE.tar.gz"
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/unipivot_*.tar.gz 2>/dev/null | tail -5

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo "Total backup size: $TOTAL_SIZE"
