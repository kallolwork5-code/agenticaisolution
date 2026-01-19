# Flow AI Platform

This repository contains a comprehensive AI-powered workflow automation platform with document processing, analytics, and intelligent agent orchestration.

## backend/
Contains the complete Flow AI backend:
- FastAPI with multiple specialized APIs
- AI-powered document processing and RAG
- Data management and upload systems
- Analytics and insights generation
- Prompt repository and agent orchestration

## frontend/
Modern React/Next.js frontend with:
- Interactive dashboard and analytics
- Document upload and management
- AI workflow automation interface
- Real-time data visualization

---

# DataSense AI - Intelligent Data Processing Platform

This repository contains a **production-grade AI platform** designed for **intelligent data processing, document analysis, and business insights**.  
The system processes various data formats (documents, spreadsheets, structured data) using **AI-powered classification, summarization, and analysis** with full **auditability and observability**.

This platform combines **document intelligence**, **data analytics**, and **conversational AI** to provide comprehensive data processing capabilities.

---

## 1. Platform Overview

DataSense AI is a comprehensive platform that handles:

- **Document Processing**: PDF, Word, text files with AI summarization
- **Data Management**: CSV, Excel, JSON with intelligent classification  
- **Analytics Dashboard**: Interactive charts and business insights
- **AI Workflows**: Orchestrated agent-based processing
- **Talk 2 Data**: RAG-powered document chat interface
- **Prompt Management**: Governed AI prompt repository

The platform provides explainable AI decisions with full audit trails suitable for business and compliance requirements.

---

## 2. Key Features

### 🤖 AI-Powered Processing
- **Smart Classification**: Automatic data type detection
- **Document Summarization**: AI-generated summaries and insights
- **RAG Chat**: Query documents using natural language
- **Workflow Orchestration**: Multi-agent processing pipelines

### 📊 Analytics & Insights  
- **Interactive Dashboards**: Real-time data visualization
- **Business Intelligence**: Automated insight generation
- **Performance Metrics**: Comprehensive analytics tracking
- **Export Capabilities**: Professional report generation

### 🔒 Enterprise Ready
- **Audit Trails**: Complete processing history
- **User Management**: Role-based access control
- **API Documentation**: Comprehensive REST APIs
- **Scalable Architecture**: Production-grade infrastructure

---

## 3. Architecture

The platform uses a modern microservices architecture:

- **Backend**: FastAPI with specialized service modules
- **Frontend**: Next.js with responsive design
- **AI Services**: LangChain integration with GPT-4o-mini
- **Vector Storage**: ChromaDB for document embeddings
- **Database**: SQLite with SQLAlchemy ORM

---

## 4. Module Overview

### 📝 Prompt Repository
Manage and organize AI prompts for various processing workflows

### 💾 Data Management  
Upload, process, and manage documents and structured data files

### 📊 Analytics Dashboard
View comprehensive analytics, charts, and insights from your data

### ⚡ AI Workflows
Visual agent orchestration for automated analysis with real-time monitoring

### 💬 Chatbot
Interactive AI assistant for general queries and system support

### 🧠 Talk 2 Data
Chat with your uploaded documents using AI-powered analysis and RAG

---

## 5. Getting Started

### Prerequisites
- Python 3.10+ (backend)
- Node.js 18+ (frontend)
- OpenAI API key (for AI features)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY to .env
python -m uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:9000
- API Documentation: http://localhost:9000/docs

---

## 6. Key Technologies

- **Backend**: FastAPI, SQLAlchemy, LangChain, ChromaDB
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4o-mini, Sentence Transformers
- **Database**: SQLite (development), PostgreSQL (production)
- **Vector Store**: ChromaDB with persistent storage

---

## 7. API Endpoints

### Core APIs
- `/api/upload/` - File upload and processing
- `/api/talk2data/` - Document chat and RAG
- `/api/prompts/` - Prompt management
- `/api/users/` - User management
- `/api/insights/` - Analytics and insights

### Real-time Features
- WebSocket support for live updates
- Real-time chat interface
- Progress tracking for file processing

---

## 8. Production Deployment

The platform is designed for production use with:

- **Environment Configuration**: Separate configs for dev/staging/prod
- **Database Migration**: SQLAlchemy migrations
- **Security**: JWT authentication, CORS configuration
- **Monitoring**: Comprehensive logging and error tracking
- **Scalability**: Microservices architecture

---

## 9. Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 10. License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 11. Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the module-specific README files

---

**DataSense AI** - Transforming data into intelligent insights through AI-powered processing and analysis.