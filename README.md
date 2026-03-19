# 🎓 Stay-On-Track: AI-Powered Student Success Platform

> A comprehensive, predictive analytics and intervention platform designed to identify at-risk students and provide actionable insights to prevent dropout.

![Stay On Track Banner](https://via.placeholder.com/1200x300.png?text=Stay-On-Track+AI+Platform)

## 📖 Overview

**Stay-On-Track** is a full-stack, AI-driven educational platform designed to empower institutions with predictive insights. The system continuously monitors student data (academic, behavioral, and demographic) to predict dropout risks in real-time. By utilizing advanced machine learning models (like CatBoost & TensorFlow) alongside Explainable AI techniques (SHAP & LIME), the platform not only highlights *who* is at risk but precisely *why*, enabling counselors and admins to deploy timely interventions.

## ✨ Key Features

- **Predictive Analytics Engine:** High-accuracy dropout risk prediction using CatBoost and TensorFlow.
- **Explainable AI (XAI):** Integrated SHAP and LIME to interpret deep learning and tree-based model decisions, providing clear insights into risk factors to staff.
- **Interactive Dashboards:** A stunning frontend built with Next.js 16 and Recharts, providing real-time data visualization of student metrics.
- **Automated Interventions:** A rules engine for dynamically suggesting counseling, financial aid, or academic tutoring.
- **Scalable Backend API:** A deeply integrated Flask/SQLAlchemy backend for robust data management and ML model serving.

## 🛠️ Technology Stack

**Frontend (Next.js App Router):**
- React 19 & Next.js 16
- Tailwind CSS v4 & PostCSS
- Recharts (Data Visualization)
- Lucide React (Icons)
- Playwright (E2E Testing)

**Backend (Flask & ML Pipeline):**
- Flask & Flask-CORS
- Flask-SQLAlchemy (Relational DB)
- **Machine Learning Layer:** Scikit-Learn, CatBoost, TensorFlow
- **Explainability:** SHAP & LIME
- **Data Engineering:** Pandas, NumPy, Imbalanced-learn (SMOTE)

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- Python (v3.9+)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
python run_dev.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be accessible at [http://localhost:3000](http://localhost:3000) and the backend API at `http://localhost:5000`.

## 🧪 Testing and Automation

The project includes an extensive QA automation and End-to-End browser testing suite.
To run the E2E tests for the frontend:
```bash
cd frontend
npm run test:e2e
```

## 📂 Project Structure

```
student-ai/
├── backend/            # Flask REST API and DB Models
├── frontend/           # Next.js 16 React Application
├── ml_engine/          # Machine learning training scripts and data generators
├── instance/           # Local SQLite database volumes
├── saved_models/       # Serialized ML models (*.pkl, *.h5, *.model)
└── .gitignore          # Strict ignore rules for smooth GitHub pushing
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---
*Built to ensure every student stays on track towards success.*
