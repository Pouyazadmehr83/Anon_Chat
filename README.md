# Anon_Chat

Anon_Chat is an anonymous chat web application built with Flask. It enables users to join chat rooms and exchange messages without creating persistent user accounts — useful for quick, ephemeral conversations or prototype chat experiences.

Repository: https://github.com/Pouyazadmehr83/Anon_Chat

## Project summary

Anon_Chat aims to provide a minimal, privacy-focused chat experience:

- Anonymous sessions — no persistent registration required
- Named or random chat rooms (public or private via token)
- Real-time messaging (typically implemented with WebSockets / Flask-SocketIO)
- Message persistence optional (in-memory for ephemeral chats or DB-backed for history)
- Simple web UI using HTML/CSS and minimal JavaScript

> Note: This README assumes Flask is the primary backend. If your project uses Flask-SocketIO or another real-time library, follow the SocketIO-specific run instructions below.

## Technologies

- Python 3.8+
- Flask (core)
- Optional: Flask-SocketIO (for WebSocket real-time messaging)
- Storage: in-memory (development) or SQLite/Postgres for persistence
- Frontend: Jinja2 templates and vanilla JS / Socket.IO client
- Optional: Redis (message queue / pubsub) for scaling Socket.IO

## Requirements

- Git
- Python 3.8+
- pip
- virtualenv
- If using WebSockets at scale: Redis or message queue backend
- If using Flask-SocketIO: eventlet or gevent (for production async workers)

## Installation — exact steps (local development)

1. Clone the repository
   git clone https://github.com/Pouyazadmehr83/Anon_Chat.git
   cd Anon_Chat

2. Create & activate virtual environment
   # macOS / Linux
   python -m venv .venv
   source .venv/bin/activate

   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

3. Install dependencies
   pip install -r requirements.txt

   If using Socket.IO and no requirements file:
   pip install flask flask-socketio eventlet python-dotenv

4. Configure environment variables (create `.env`)
   FLASK_APP=app.py           # or the actual entrypoint
   FLASK_ENV=development
   SECRET_KEY=replace_with_secure_key
   REDIS_URL=redis://localhost:6379  # optional for production

5. Initialize DB (if used)
   flask db upgrade   # if Flask-Migrate is used
   or run any provided initialization script

6. Run server — basic Flask (development)
   flask run --host=0.0.0.0 --port=5000
   Open http://localhost:5000

7. Run server — with Flask-SocketIO (for real-time)
   # Using eventlet
   pip install eventlet
   python app.py   # ensure app instantiates SocketIO and calls socketio.run(app, host='0.0.0.0', port=5000, debug=True)

   # Example run if using gunicorn with gevent (production)
   pip install gevent
   gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 "app:app" --bind 0.0.0.0:8000

## Features & behavior

- Anonymous identities: users can choose a temporary display name or get a random one.
- Rooms: create/join rooms by name or token; public rooms listed on a discovery page (optional).
- Message lifecycle: messages may be ephemeral (in-memory) or persisted for a retention period.
- Moderation: admin endpoints or simple filters for abusive content (recommended for deployment).
- Sanitization: always sanitize/escape user input to prevent XSS.

## Security & privacy considerations

- Do not store sensitive personal data — the app is designed for ephemeral, anonymous use.
- Rate-limit message posting to avoid spam.
- Sanitize all incoming messages and avoid reflecting raw HTML.
- Use HTTPS in production and set secure cookies and appropriate headers.

## Scaling & production tips

- Use Redis as a message queue / pubsub backend for Socket.IO when scaling across workers.
- Run multiple workers behind an Nginx reverse proxy.
- Monitor active connections and memory usage when storing messages in memory.
- Consider message retention policies and automated pruning.

## Tests

- Add unit tests for message parsing, room management, and any auth/creation logic.
- Run tests with pytest:
  pytest

## Contributing

- Fork → branch → PR
- Provide tests for new features and keep the public API stable
- Document any changes to the message schema or room semantics

## License & Contact

- Add a LICENSE file to define permitted reuse (e.g., MIT).
- Author: Pouyazadmehr83
