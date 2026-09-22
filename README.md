# Kollab Platform 🚀

**Kollab** is an AI-powered collaborative student placement & project management platform designed to track peer project velocity, proctor skill assessments, analyze skill gaps, and prepare students for campus placement drives.

---

## 🌟 Key Features

### 1. 📁 Persistent Collaborative Projects
- Create and manage team projects with persistent state across sessions.
- Assign tech stacks, track milestone completion, and manage project member roles.
- View detailed project overview, task breakdown, and team rosters without placeholder fallbacks.

### 2. 📋 Proctored Sprint Kanban Workspace
- Project-scoped Kanban boards featuring **Backlog**, **In Progress**, **In Review**, and **Done** columns.
- Interactive task creation with priority tags (`High`, `Medium`, `Low`) and assignee tracking.
- Starts clean with 0 pre-populated tasks for newly created projects.

### 3. 🤖 AI Placement Career Suite
- **AI Resume Action Bullet Generator**: Transforms project descriptions into STAR-formatted high-impact resume bullets.
- **Skill Gap Analyzer**: Compares verified student badges against Tier 1 tech company job descriptions.
- **Best Role Match Finder**: AI role compatibility scoring calculated from verified skills and project telemetry.

### 4. 🛡️ Anti-Cheat Proctored Assessments
- Proctored MCQ test engine with full screen lock, timer countdowns, and automated tab-switch telemetry detection.
- Automated score verification and skill badge issuance.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite, TailwindCSS |
| **State Management** | Zustand (with `persist` local storage & API sync) |
| **Icons & Visuals** | Lucide React, Recharts |
| **Backend API** | Python, FastAPI, Async SQLAlchemy, Pydantic |
| **Database** | SQLite / PostgreSQL (Async Engine) |
| **Cloud Infrastructure** | AWS (App Runner, RDS PostgreSQL, S3 Bucket) |
| **Infrastructure as Code** | HashiCorp Terraform |
| **Security & Auth** | Passlib (Bcrypt), PyJWT authentication middleware |

---

## 📁 Repository Structure

```
Kollab-Platform/
├── backend/                  # FastAPI Backend API Server
│   ├── models/               # SQLAlchemy Async Models (User, Project, Task, Test, etc.)
│   ├── routes/               # API Endpoint Controllers (/api/projects, /api/ai, /api/tests)
│   ├── schemas/              # Pydantic Request/Response Validation Schemas
│   ├── services/             # Business Logic & AI Services
│   ├── utils/                # Database Seeders, Security & JWT Helpers
│   ├── main.py               # FastAPI App Entrypoint
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # Vite + React Frontend Application
│   ├── src/
│   │   ├── api/              # Axios Client & API Services
│   │   ├── components/       # Reusable UI Components & Charts
│   │   ├── pages/            # Student & Coordinator Page Views
│   │   ├── store/            # Zustand Persistent Stores (projectStore, kanbanStore, authStore)
│   │   └── types/            # TypeScript Interfaces
│   └── package.json          # Node.js Dependencies & Build Scripts
├── infra/
│   └── terraform/            # Terraform AWS Provisioning (App Runner, RDS, S3)
│       ├── main.tf           # AWS Provider, S3, RDS & App Runner resources
│       ├── variables.tf      # Environment & Region Configuration
│       ├── outputs.tf        # Service URL & Endpoint Exports
│       └── terraform.tfvars.example
└── README.md                 # Platform Documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Terraform**: v1.5+ *(Optional for Cloud Deployment)*

---

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Activate virtual environment (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI server (runs on http://localhost:5000)
python main.py
```

FastAPI interactive documentation will be available at: `http://localhost:5000/docs`

---

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## ☁️ AWS Infrastructure Deployment (Terraform)

Kollab includes production-ready HashiCorp Terraform configuration for automated deployment on Amazon Web Services (AWS).

### Provisioned AWS Resources:
- **AWS App Runner**: Managed container service hosting the FastAPI backend.
- **AWS RDS (PostgreSQL)**: Fully managed relational database instance.
- **AWS S3 Bucket**: Secure storage for student resume PDFs and avatar uploads.

### Terraform Deployment Commands:

```bash
# Navigate to terraform configuration directory
cd infra/terraform

# Initialize Terraform AWS provider plugins
terraform init

# Create your terraform.tfvars file
cp terraform.tfvars.example terraform.tfvars

# Preview planned cloud infrastructure creation
terraform plan

# Apply and provision resources on AWS
terraform apply
```

Upon completion, Terraform outputs your live backend **App Runner Service URL** and database endpoints.

---

## 📦 Building for Production

To compile and build the production bundle:

```bash
cd frontend
npm run build
```

The compiled assets will be generated inside `frontend/dist/`.

---

## 🤝 Contributing & License

Developed for the **Kollab Platform** project. Distributed under the MIT License.
