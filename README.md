# 🏥 MedAnalyze - AI-Powered Medical Report Analytics Platform

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Backend Repository**: [https://github.com/PavanTej219/blocky](https://github.com/PavanTej219/blocky)

MediExtract is a comprehensive medical intelligence platform that leverages cutting-edge AI technologies from Google to extract, analyze, and provide insights from medical reports. The system uses Google Cloud Vision API for OCR, Google Gemini API for intelligent text processing, and provides a seamless interface for medical report management and consultation booking.

## 🌟 Key Features

### 📊 **Intelligent Document Processing**
- **Google Cloud Vision API Integration**: Advanced OCR technology to extract text from medical reports with high accuracy
- **Google Gemini API**: Intelligent parsing and structuring of medical data into JSON format
- **Multi-format Support**: Process PNG, JPG, and JPEG medical documents
- **Batch Processing**: Upload and process multiple reports simultaneously

### 🤖 **AI-Powered Analytics**
- **RAG (Retrieval-Augmented Generation)**: Query your medical reports using natural language
- **Comparative Analysis**: Side-by-side comparison of multiple test reports in tabular format
- **Abnormal Value Detection**: Automatic identification of out-of-range medical test results
- **Contextual Insights**: Get detailed explanations, dietary recommendations, and lifestyle suggestions

### 👨‍⚕️ **Doctor Consultation Integration**
- **Specialist Recommendations**: AI-driven specialist suggestions based on abnormal test results
- **Location-Based Search**: Find doctors in your city across major Indian metropolitan areas
- **Multi-Source Aggregation**: Integrates with Practo and other medical directories
- **Direct Booking**: One-click access to doctor profiles and appointment booking

### 💾 **Advanced Data Management**
- **Vector Database**: Qdrant-powered semantic search for medical records
- **OpenRouter Embeddings**: BGE-large-en-v1.5 model for high-quality document embeddings
- **Persistent Storage**: Secure storage and retrieval of processed medical data
- **Real-time Status**: Live database statistics and health monitoring

### 🎨 **Premium User Experience**
- **Modern UI/UX**: Glassmorphic design with smooth animations
- **Responsive Interface**: Optimized for desktop and mobile devices
- **Interactive Chat**: Natural conversation flow with the AI assistant
- **Real-time Processing**: Live feedback during document upload and analysis

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **OCR Engine**: Google Cloud Vision API
- **AI/ML**: 
  - Google Gemini API (gemini-1.5-flash) for intelligent text processing
  - Groq API (llama-3.3-70b-versatile) for conversational AI
- **Vector Database**: Qdrant Cloud
- **Embeddings**: OpenRouter (baai/bge-large-en-v1.5)
- **RAG Framework**: LlamaIndex
- **Web Scraping**: BeautifulSoup4, Requests

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Styling**: Inline CSS with advanced animations
- **Icons**: Lucide React
- **State Management**: React Hooks

### Infrastructure
- **Backend Deployment**: Railway
- **Database**: Qdrant Cloud (Vector Store)
- **API Gateway**: CORS-enabled REST API

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16+ and npm
- Google Cloud Platform account with Vision API enabled
- Qdrant Cloud account
- OpenRouter API key
- Groq API key

## 🚀 Installation & Setup

### Backend Setup

1. **Clone the backend repository**
```bash
git clone https://github.com/PavanTej219/blocky.git
cd blocky
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Google Cloud Vision API
GOOGLE_VISION_API_KEY=your_google_vision_api_key

# Groq API (for conversational AI)
GROQ_API_KEY=your_groq_api_key

# Qdrant Vector Database
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_api_key

# OpenRouter Embeddings
OPENROUTER_API_KEY=your_openrouter_api_key
```

5. **Run the backend server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API endpoint**

Update the `API_BASE_URL` in your frontend code:
```javascript
const API_BASE_URL = 'http://localhost:8000';  // For local development
// const API_BASE_URL = 'https://your-backend-url.railway.app';  // For production
```

4. **Start the development server**
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🔑 API Keys Setup Guide

### Google Cloud Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Cloud Vision API
4. Navigate to "APIs & Services" > "Credentials"
5. Create an API key and copy it

### Qdrant Cloud
1. Sign up at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a new cluster
3. Copy the cluster URL and API key from the dashboard

### OpenRouter
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up and navigate to API Keys
3. Generate a new API key

### Groq
1. Go to [Groq Cloud](https://console.groq.com/)
2. Create an account and generate an API key

## 📖 Usage Guide

### 1. Upload Medical Reports
- Click on the upload area or drag-and-drop medical report images
- Select multiple reports for batch processing
- Click "Process with AI" to extract and structure the data

### 2. Query Your Reports
- Use natural language to ask questions about your medical data
- Examples:
  - "Show me all my blood test results"
  - "Compare my last two cholesterol reports in tabular form"
  - "What are my abnormal test values?"
  - "Give me dietary recommendations based on my reports"

### 3. Get Specialist Recommendations
- The system automatically detects abnormal values
- Click "Book Consultation" to find specialists
- Enter your city and state
- Browse verified doctors and book appointments

### 4. View Report Summary
- Navigate to the "Report Summary" tab
- View detailed breakdown of all processed reports
- Access patient information and test results

## 🏗️ Project Structure

### Backend
```
blocky/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create this)
├── temp_uploads/          # Temporary storage for uploaded files
└── README.md
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── MediExtractApp.tsx    # Main application component
│   │   ├── AnimatedBackground.tsx
│   │   ├── ConsultationModal.tsx
│   │   ├── ComparisonTable.tsx
│   │   └── DoctorCard.tsx
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Health Check
```http
GET /api/health
```

### Database Status
```http
GET /api/database/status
```

### Process Reports
```http
POST /api/process-reports
Content-Type: multipart/form-data

files: [File, File, ...]
```

### Query Reports
```http
POST /api/query
Content-Type: application/json

{
  "query": "string",
  "patient_name": "string (optional)"
}
```

### Find Doctors
```http
POST /api/find-doctors
Content-Type: application/json

{
  "city": "string",
  "state": "string",
  "specialty": "string"
}
```

## 🎯 Sample Queries

- "I want comparison based on my two blood reports in tabular form"
- "Compare the two reports side by side"
- "Are there any abnormal test results?"
- "Show me all test results with abnormal values"
- "What medical conditions do these results indicate?"
- "List all blood test results with their ranges"
- "What dietary changes should I make based on my cholesterol levels?"
- "Explain my liver function test results"

## 🔒 Security & Privacy

- All medical data is processed securely
- HIPAA compliance considerations implemented
- No data is stored permanently without user consent
- API keys are never exposed to the frontend
- Secure communication via HTTPS in production

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Google Vision API authentication error
```
Solution: Verify your API key is correct and the Vision API is enabled in your Google Cloud project
```

**Issue**: Qdrant connection timeout
```
Solution: Check your Qdrant cluster URL and API key. Ensure your cluster is running.
```

**Issue**: Import errors
```
Solution: Ensure all dependencies are installed: pip install -r requirements.txt
```

### Frontend Issues

**Issue**: CORS errors
```
Solution: Ensure the backend CORS middleware is configured to allow your frontend origin
```

**Issue**: API connection refused
```
Solution: Verify the backend server is running and the API_BASE_URL is correct
```

## 🚀 Deployment

### Backend Deployment (Railway)
1. Push your code to GitHub
2. Connect your repository to Railway
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

### Frontend Deployment (Vercel/Netlify)
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update the API_BASE_URL to your production backend URL

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Pavan Tej** - [GitHub](https://github.com/PavanTej219)

## 🙏 Acknowledgments

- Google Cloud Vision API for OCR capabilities
- Google Gemini API for intelligent text processing
- Qdrant for vector database infrastructure
- OpenRouter for embedding services
- Groq for fast LLM inference
- Practo for medical directory integration
- The open-source community for amazing tools and libraries

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/PavanTej219/blocky/issues)
- Email: support@mediextract.com (if applicable)

## 🔮 Future Enhancements

- [ ] Multi-language support for medical reports
- [ ] Voice-based query interface
- [ ] Mobile applications (iOS/Android)
- [ ] Integration with hospital EMR systems
- [ ] Prescription management system
- [ ] Appointment scheduling system
- [ ] Health tracking and trends analysis
- [ ] Export reports as PDF/Excel
- [ ] Share reports with doctors securely

---

**Made with ❤️ using Google Cloud Technologies**
