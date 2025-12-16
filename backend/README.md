# CollectiSense AI - Backend

This is the FastAPI backend for CollectiSense AI with authentication, data processing, and AI agent capabilities.

## Features

- 🚀 FastAPI with automatic OpenAPI documentation
- 🔐 JWT-based authentication with secure password hashing
- 🤖 LangChain & LangGraph integration for AI agents
- 📊 SQLAlchemy ORM with SQLite database
- 🧪 Pytest testing suite
- 📝 Comprehensive API documentation

## Getting Started

### Prerequisites

- Python 3.11+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database:
```bash
python init_db.py
```

### Development

Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: [http://localhost:8000](http://localhost:8000)
- Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative docs: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Testing

Run tests:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app tests/
```

Run specific test file:
```bash
pytest tests/test_auth.py -v
```

## Default User

The database initialization creates a default admin user:
- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Health Check
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint

## Project Structure

```
backend/
├── app/
│   ├── api/              # API route handlers
│   ├── db/               # Database configuration
│   ├── middleware/       # Authentication middleware
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── main.py           # FastAPI application
├── tests/                # Test files
├── init_db.py           # Database initialization
└── requirements.txt     # Python dependencies
```

## Technologies Used

- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation and serialization
- **python-jose** - JWT token handling
- **passlib** - Password hashing
- **pytest** - Testing framework
- **LangChain** - AI/LLM integration
- **LangGraph** - AI agent orchestration

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///./prompts.db
OPENAI_API_KEY=your-openai-api-key
```

## Security

- JWT tokens with configurable expiration
- Secure password hashing with PBKDF2
- CORS middleware for cross-origin requests
- Input validation with Pydantic models