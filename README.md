# 🧠 AI Interview Prep Platform V 1.0

An AI-powered interview preparation platform that helps you practice technical and HR interviews, extract skills from your resume, get real-time AI feedback, and track your performance over time.



---

## ✨ Features

- 🔐 **Authentication** — Signup, Login with email OTP verification
- 📄 **Resume Upload** — Upload PDF resume, AI extracts your skills automatically
- 🎤 **Practice Interviews** — AI generates questions based on your skills and chosen topic
- 📊 **Real-time Scoring** — Every answer is evaluated by AI with feedback and ideal answer
- 📈 **Performance Tracking** — View scores per topic across all sessions
- 🔖 **Bookmarks** — Save important questions for later review
- 📉 **Weak Topics** — Automatically identifies topics where you score below 65%
- 🏠 **Dashboard** — Overview of all your stats, recent interviews, resume status

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework |
| React Router v7 | Client-side routing |
| Lucide React | Icons |
| CSS Modules | Styling |

### Backend
| Technology | Purpose |
|---|---|
| Flask | REST API framework |
| Flask-SQLAlchemy | ORM |
| Flask-JWT-Extended | JWT authentication |
| Flask-Bcrypt | Password hashing |
| Flask-CORS | Cross-origin requests |
| PyMySQL | MySQL driver |
| pdfplumber | PDF text extraction |
| Groq API | AI skill extraction + question generation + answer evaluation |
| email-validator | Real email validation |
| smtplib | OTP email sending |

### Database
| Technology | Purpose |
|---|---|
| MySQL | Primary database |

---

## 📁 Project Structure

```
AI Interview Prep/
├── AI Interview/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── Pages/              # All page components
│   │   │   ├── Auth/           # Login, Signup, OTP, ForgotPassword
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Resume.jsx
│   │   │   ├── PracticeInterview.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Performance.jsx
│   │   │   ├── WeakTopics.jsx
│   │   │   └── Bookmarks.jsx
│   │   ├── Components/         # Reusable components
│   │   │   ├── Header/
│   │   │   ├── SideBar/
│   │   │   └── DashboardTopBar/
│   │   ├── context/            # AuthContext (global auth state)
│   │   └── services/           # API service layer
│   └── vite.config.js
│
└── backend/                    # Backend (Flask)
    ├── app.py                  # App entry point
    ├── config.py               # Configuration (gitignored)
    ├── config.example.py       # Config template
    ├── models/                 # SQLAlchemy models
    ├── routes/                 # Flask blueprints (API endpoints)
    ├── services/               # Business logic
    ├── utils/                  # Helper functions
    ├── middleware/             # Auth middleware
    ├── uploads/                # PDF upload storage
    └── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8.0+
- Groq API key — [console.groq.com](https://console.groq.com)
- Gmail App Password — [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

### 1. Clone the repository

```bash
git clone https://github.com/awaisbhatti267/AI-Interview-Prep.git
cd AI-Interview-Prep
```

---

### 2. Database Setup

Open MySQL Workbench or any MySQL client and run:

```sql
CREATE DATABASE ai_interview;
```

---

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Copy the config template and fill in your credentials:

```bash
cp config.example.py config.py
```

Edit `config.py` and update:
- `MYSQL_PASSWORD` — your MySQL root password
- `GROQ_API_KEY` — your Groq API key
- `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` — your Gmail and app password

Run the backend:

```bash
python app.py
```

Flask will automatically create all database tables on first run.

> Backend runs on `http://localhost:5000`

---

### 4. Frontend Setup

```bash
cd "AI Interview"
npm install
npm run dev
```

> Frontend runs on `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| GET | `/api/auth/me` | Get current user |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload PDF + extract skills |
| GET | `/api/resume/` | Get current resume |

### Interview
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/start` | Start interview session |
| POST | `/api/interview/answer` | Submit & evaluate answer |
| POST | `/api/interview/:id/complete` | Complete session |
| GET | `/api/interview/history` | Get all past interviews |
| GET | `/api/interview/performance` | Get per-topic stats |
| GET | `/api/interview/weak-topics` | Get weak topics |

### Bookmarks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookmarks/` | List bookmarks |
| POST | `/api/bookmarks/toggle` | Bookmark / unbookmark |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/` | Get all dashboard stats |

---

## 🗄 Database Schema

```
users               — id, name, email, password, is_verified, otp_code, otp_expires_at
resumes             — id, user_id, filename, filepath, skills (JSON), raw_text
interviews          — id, user_id, topic, total_questions, score, status
interview_questions — id, interview_id, question, user_answer, ai_feedback, score, is_bookmarked
bookmarks           — id, user_id, question_id
```

---

## 🔮 Roadmap (Version 2.0)

- [ ] Upgrade backend to Django or FastAPI
- [ ] Voice-based interview mode
- [ ] Resume builder
- [ ] Scheduled mock interviews
- [ ] Company-specific interview tracks
- [ ] Leaderboard and community features

---

## 👤 Author

**Awais Bhatti**
- GitHub: [@awaisbhatti267](https://github.com/awaisbhatti267)

---

## 📄 License

This project is for educational and personal use.
