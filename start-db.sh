#!/bin/bash
# =========================================
# PostgreSQL auto-starter for Comments App
# =========================================

DB_CONTAINER="comments-db"
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=commentsdb

echo "🔍 Checking for running PostgreSQL container..."

if [ "$(docker ps -q -f name=$DB_CONTAINER)" ]; then
  echo "✅ PostgreSQL container already running."
else
  if [ "$(docker ps -aq -f status=exited -f name=$DB_CONTAINER)" ]; then
    echo "♻️  Restarting existing PostgreSQL container..."
    docker start $DB_CONTAINER
  else
    echo "🚀 Launching new PostgreSQL container..."
    docker run --name $DB_CONTAINER \
      -e POSTGRES_USER=$POSTGRES_USER \
      -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
      -e POSTGRES_DB=$POSTGRES_DB \
      -p $DB_PORT:5432 \
      -d postgres
  fi
fi

echo ""
echo "📡 Waiting for PostgreSQL to be ready..."
sleep 5

if docker exec -it $DB_CONTAINER pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
  echo "✅ PostgreSQL is up and ready on port $DB_PORT"
  echo "   DB_NAME: $POSTGRES_DB"
  echo "   USER:    $POSTGRES_USER"
  echo "   PASS:    $POSTGRES_PASSWORD"
else
  echo "❌ PostgreSQL failed to start."
  exit 1
fi

echo ""
echo "You can now run:"
echo "  npm run dev"
