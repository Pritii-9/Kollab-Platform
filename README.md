# Kollab Platform 🚀

**Kollab** is an AI-powered collaborative student placement, proctored assessment & project management platform designed to track peer project velocity, proctor skill assessments, analyze skill gaps, broadcast department updates, and prepare students for placement drives.

---

## 🌟 Key Features

### 1. 🛡️ Proctored Skill Assessments & AI Prompt Engine
- **LLM Directives & Presets**: Configure custom AI test focus areas using 1-click prompt presets (*Async & JWT Auth*, *System Design*, *Data Structures*, *SQL Indexing*, *REST Security*).
- **Anti-Cheat Proctor Controls**: Randomized question/choice order, strict fullscreen enforcement, and automated tab-switch warning limits.
- **Live Deployment Feed & Telemetry**: Instant database synchronization showing live active test deployments, submission counters, and verified pass rates.

### 2. 📢 Department Broadcast & Fan-Out Announcements
- **Cohort Targeting**: Coordinators can broadcast department-wide announcements targeted by academic branch (*CSE*, *IT*, *AI&DS*, *AIML*) or year.
- **Real-Time Student Inbox**: Automated notification fan-out delivering alerts to student header badges with unread counters and 1-click read state.

### 3. 📁 Persistent Collaborative Projects & Proctored Kanban
- **Project-Scoped Kanban**: Track sprint tasks across **Backlog**, **In Progress**, **In Review**, and **Done** columns with priority badges and assignees.
- **Persistent Database Sync**: Real-time project creation, member role management, tech stack tagging, and progress tracking.

### 4. 🤖 AI Placement Career Suite & Resume Action Generator
- **AI Action Bullet Generator**: Transforms project descriptions into STAR-formatted high-impact resume bullets.
- **Skill Gap Analyzer**: Compares verified student badges against Tier 1 tech company job requirements.
- **Role Match Compatibility**: AI role readiness scoring calculated from verified assessment scores and project velocity.

### 5. 👥 Admin Control Center & Live Student Directory
- **Batch & Student Management**: Live management of student cohorts, dynamic profile editing, roll number verification, and department status tracking.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite, TailwindCSS, Lucide Icons |
| **State Management** | Zustand (with `persist` local storage & API sync) |
| **Backend API** | Python 3.11, FastAPI, Async SQLAlchemy, Pydantic v2 |
| **Caching & Rate Limit** | Redis 7 (Alpine), sliding-window rate limiting |
| **Database** | PostgreSQL 15 (with `pgvector` extension) / SQLite |
| **Containerization** | Docker, Docker Compose, Nginx |
| **Cloud Infrastructure** | AWS (App Runner, RDS PostgreSQL, S3 Bucket) |
| **Infrastructure as Code**| HashiCorp Terraform |

---

## 🐳 Docker Deployment (Recommended)

Kollab is fully containerized with multi-stage Docker builds and an Nginx reverse proxy.

### 1-Command Local Launch:
```bash
# Clone repository
git clone https://github.com/Pritii-9/Kollab-Platform.git
cd Kollab-Platform

# Copy environment template
cp .env.example .env

# Build and start all services (Frontend, Backend, Postgres, Redis)
docker compose up -d --build
```

- **Frontend App**: `http://localhost`
- **FastAPI Backend Docs**: `http://localhost:5000/docs`
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

## ⚡ Local Development Setup (Manual)

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # Windows
# source venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```
FastAPI interactive docs will be available at `http://localhost:5000/docs`.

---

### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Application will be running at `http://localhost:5173`.

---

## 📁 Repository Structure

```
Kollab-Platform/
├── backend/                  # FastAPI Backend API Server
│   ├── models/               # SQLAlchemy Async Models (User, Project, Task, Test, Announcement)
│   ├── routes/               # API Endpoint Controllers (/api/projects, /api/tests, /api/announcements)
│   ├── schemas/              # Pydantic Request/Response Validation Schemas
│   ├── services/             # Business Logic & AI Prompt Services
│   ├── utils/                # JWT Helpers, Rate Limiting & Database Seeders
│   ├── Dockerfile            # Python 3.11 Multi-stage Dockerfile
│   └── main.py               # FastAPI App Entrypoint
├── frontend/                 # Vite + React Frontend Application
│   ├── src/
│   │   ├── api/              # Axios Client & Service Modules
│   │   ├── components/       # Reusable UI Components & Navbars
│   │   ├── pages/            # Coordinator & Student Page Views
│   │   ├── store/            # Zustand Stores (authStore, kanbanStore, projectStore)
│   │   └── types/            # TypeScript Interfaces
│   ├── nginx.conf            # Nginx SPA & API Reverse Proxy Configuration
│   ├── Dockerfile            # React + Nginx Alpine Dockerfile
│   └── package.json          # Node.js Dependencies & Build Scripts
├── infra/
│   └── terraform/            # Terraform AWS Provisioning (App Runner, RDS, S3)
├── docker-compose.yml        # Docker Compose Stack (DB, Redis, Backend, Frontend)
├── .env.example              # Environment Variable Template
└── README.md                 # Platform Documentation
```

---

## ☁️ AWS Infrastructure Deployment (Terraform)

Automated cloud deployment setup is included under `infra/terraform/`:

```bash
cd infra/terraform
terraform init
cp terraform.tfvars.example terraform.tfvars
terraform plan
terraform apply
```

---

## 🤝 License & Credits

Developed for the **Kollab Platform** project. Distributed under the MIT License.
