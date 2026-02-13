#!/bin/bash
set -e

echo "Setting up TaskManager Docker environment..."

mkdir -p db_data
chmod 777 db_data

# move existing DB to db_data ifit exists
if [ -f db.sqlite3 ]; then
    mv db.sqlite3 db_data/db.sqlite3
    echo "Moved existing db.sqlite3 to db_data/"
fi

docker-compose up --build