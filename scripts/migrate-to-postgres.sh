#!/bin/bash

echo "=== SQLite → PostgreSQL 마이그레이션 ==="

SQLITE_DB="prisma/data/unipivot.db"
PG_USER="unipivot"
PG_DB="unipivot"

# Export tables from SQLite and import to PostgreSQL
tables=("User" "Account" "Session" "VerificationToken" "Program" "ProgramSession" "Registration" "Attendance" "PointHistory" "Book" "BookOnProgram" "BookReport" "Project" "Milestone" "Partner" "PartnerOnProject" "Document" "CalendarEvent" "Transaction" "Deposit" "Donation" "Expert" "Talent" "ChatLog" "KnowledgeBase" "Notice" "BlogPost" "PageContent" "Menu" "SiteSetting" "Banner" "ActivityLog" "Notification" "EmailLog")

for table in "${tables[@]}"; do
    echo "마이그레이션: $table"

    # Check if table exists and has data
    count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM $table;" 2>/dev/null)

    if [ -n "$count" ] && [ "$count" -gt 0 ]; then
        # Export to CSV
        sqlite3 -header -csv "$SQLITE_DB" "SELECT * FROM $table;" > "/tmp/${table}.csv" 2>/dev/null

        if [ -s "/tmp/${table}.csv" ]; then
            # Import to PostgreSQL using \copy
            sudo -u postgres psql -d "$PG_DB" -c "\copy \"$table\" FROM '/tmp/${table}.csv' WITH (FORMAT csv, HEADER true);" 2>/dev/null
            echo "  $count 레코드 완료"
        fi
    else
        echo "  테이블 비어있음 또는 없음"
    fi
done

echo ""
echo "=== 마이그레이션 완료 ==="
