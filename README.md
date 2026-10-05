# Kollab — Student Placement & Project Platform

A full-stack campus platform connecting students and placement coordinators. It helps coordinators create and evaluate skill assessments, while giving students tools to test their skills, collaborate on project tasks, and prepare for placement drives.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy (Async), PostgreSQL / SQLite
- **Caching & Rate Limiting:** Redis
- **Machine Learning & AI:** Scikit-Learn (RandomForestClassifier), Groq API (LLaMA 3.3)
- **Cloud Storage:** AWS S3 (`boto3`)
- **Frontend:** React 19, TypeScript, Tailwind CSS, Zustand, Vite

---

## ✨ What It Actually Does

### 1. 📝 Proctored Skill Assessments
- Coordinators configure and assign tests with customizable timers, question counts, and passing cutoffs.
- Students take timed tests inside a locked-down browser interface.
- **Anti-Cheat & Reliability:**
  - Detects tab switches using the browser's `visibilitychange` API (warns student; auto-submits after 3 switches).
  - Blocks right-click and copy-pasting during active tests.
  - Automatically saves draft answers to `localStorage` on every choice selection so students don't lose progress if their network drops.

### 2. 🤖 ML Placement Readiness Scoring
- Uses a **Scikit-Learn `RandomForestClassifier`** pipeline trained on student performance metrics (CGPA, assessment scores, completed sprint tasks, verified skill badges).
- Generates a **Placement Readiness Score (0–100%)**, classifies student status into risk tiers (`Placement Ready`, `On Track`, `At Risk`), and provides specific recommendations on what to improve before placement drives.

### 3. ⚡ AI Career & Exam Generation
- **Dynamic Question Generator:** Uses Groq LLM to generate topic-wise technical multiple-choice questions on demand when a coordinator assigns a test.
- **Resume Bullet Formatter:** Converts rough project descriptions into structured STAR-format bullet points.
- **Security:** Sanitizes input prompts to prevent prompt injection and falls back to built-in question pools if the AI API is unreachable.

### 4. 📊 Coordinator Batch & Gradebook Management
- Multi-table database queries aggregate assessment scores, pass rates, and project participation per branch/batch.
- One-click export of complete student performance records to downloadable CSV gradebooks.

### 5. 🔒 Auth, Security & Storage
- **Redis Rate Limiting:** Uses atomic `INCR` keys with 60-second TTL expiration to prevent brute-force login attempts and API abuse.
- **Brute-Force Lockout:** Automatically disables login for 30 seconds after 5 consecutive failed password attempts.
- **AWS S3 Storage:** Stores student resumes and report documents privately in S3 with presigned URLs for secure time-limited downloads.

---

## 📂 Project Architecture

```
kollab/
├── backend/
│   ├── main.py                  # FastAPI application entry point
│   ├── database.py              # Async SQLAlchemy connection & sessions
│   ├── config.py                # Environment configuration
│   ├── models/                  # User, Test, Task, Skill, and Project tables
│   ├── routes/                  # API endpoints (auth, tests, students, ai, resume)
│   ├── services/
│   │   ├── ml_service.py        # Scikit-Learn RandomForest readiness classifier
│   │   ├── ai_service.py        # Groq LLM caller with prompt sanitization & caching
│   │   ├── test_service.py      # Test generation, submission & idempotency checks
│   │   ├── s3_service.py        # AWS S3 upload & presigned URL generator
│   │   └── readiness_service.py # Placement metric calculations
│   └── utils/
│       ├── cache.py             # Redis rate limiter & in-memory fallback
│       └── jwt.py               # Token creation and route guards
└── frontend/
    ├── src/
    │   ├── api/                 # Axios API client functions
    │   ├── components/          # Reusable UI cards, modals, layout, sidebar
    │   ├── pages/
    │   │   ├── Login.tsx        # Login & registration with lockout logic
    │   │   ├── student/         # Assessments, TakeTest, Projects, Kanban, AI Tools
    │   │   └── coordinator/     # AssignTest, TestResultsMatrix, Reports, Batches
    │   └── store/               # Zustand state stores (auth, tests, kanban)
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (Optional; falls back to in-memory cache if not running)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend API docs will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite+aiosqlite:///./kollab_local.db # or postgresql+asyncpg://...
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-north-1
S3_BUCKET_NAME=your_s3_bucket
```
