#!/bin/bash

docker compose up -d
echo "🐳 Docker containers started"

open_terminal() {
  gnome-terminal -- bash -c "$1; bash"
}

open_terminal "/usr/bin/php artisan serve"
echo "🌐 Server is running on http://localhost:8000"

open_terminal "/usr/bin/php artisan queue:listen"
echo "📋 Queue is running"

open_terminal "/usr/bin/php artisan reverb:start --debug"
echo "🔊 Reverb is running in debug mode"

open_terminal "npm run dev"
echo "💻 Frontend is running"

tail -f storage/logs/laravel.log
