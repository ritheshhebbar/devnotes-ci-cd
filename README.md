# DevNotes — Full-Stack Notes Application with CI/CD Pipeline

## Complete Project Documentation

---

## 1. Problem Statement

In modern software development, developers constantly need to capture quick ideas, code snippets, debugging notes, and random thoughts while working. Most existing note-taking applications are either too complex (Notion, Evernote) or lack developer-focused simplicity. Additionally, organizations need to demonstrate practical knowledge of DevOps principles including CI/CD pipelines, containerization, code quality analysis, and security scanning.

### Objective

Build **DevNotes** — a full-stack web application that serves as a lightweight, personal developer notebook with:

- **User Authentication** (Register/Login) with secure password hashing
- **CRUD Operations** for personal notes (Create, Read, Delete)
- **Per-user data isolation** — each user can only access their own notes
- **Modern, responsive UI** with a premium dark theme
- **Complete CI/CD Pipeline** using Jenkins, Docker, SonarCloud, and OWASP Dependency Check
- **Cloud Deployment** on Render with MongoDB Atlas as the database

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | Single Page Application |
| **Backend** | Express.js 5 (Node.js) | REST API Server |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL Database |
| **Authentication** | JWT + bcryptjs | Token-based auth with password hashing |
| **CI/CD** | Jenkins | Automated build, test, and deploy pipeline |
| **Containerization** | Docker | Application packaging and deployment |
| **Container Registry** | Docker Hub | Docker image storage |
| **Code Quality** | SonarCloud | Static code analysis and code smell detection |
| **Security** | OWASP Dependency Check | Vulnerability scanning of dependencies |
| **Hosting** | Render | Cloud platform for deployment |
| **Version Control** | GitHub | Source code management |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React Frontend (SPA)                         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │  │
│  │  │ Auth Page   │  │  Notes Page  │  │  Components    │   │  │
│  │  │ Login/      │  │  Composer    │  │  - Top Bar     │   │  │
│  │  │ Register    │  │  Note Cards  │  │  - Note Card   │   │  │
│  │  │             │  │  Empty State │  │  - Spinner     │   │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘   │  │
│  │                                                           │  │
│  │  localStorage: [token, username]                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│              │ Axios HTTP Requests (Bearer Token)               │
└──────────────┼──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Render Cloud)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Express.js Backend (Node.js)                 │  │
│  │                                                           │  │
│  │  Middleware: CORS → JSON Parser → Auth Middleware (JWT)   │  │
│  │                                                           │  │
│  │  Routes:                                                  │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────┐  │  │
│  │  │  /auth              │  │  /notes (protected)        │  │  │
│  │  │  POST /register     │  │  GET    / (user's notes)   │  │  │
│  │  │  POST /login        │  │  POST   / (create note)    │  │  │
│  │  │                     │  │  DELETE /:id (delete note)  │  │  │
│  │  └─────────────────────┘  └────────────────────────────┘  │  │
│  │                                                           │  │
│  │  Static Files: React build served from /public            │  │
│  └───────────────────────────────────────────────────────────┘  │
│              │ Mongoose ODM                                     │
└──────────────┼──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB Atlas)                       │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
│  │  users collection       │  │  notes collection            │ │
│  │  - _id (ObjectId)       │  │  - _id (ObjectId)            │ │
│  │  - username (unique)    │  │  - text (String)             │ │
│  │  - password (bcrypt)    │  │  - userId (ref → User)       │ │
│  │  - createdAt            │  │  - createdAt                 │ │
│  │  - updatedAt            │  │  - updatedAt                 │ │
│  └─────────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Project Directory Structure

```
devnotes-ci-cd/
│
├── backend/                        # Express.js Backend
│   ├── models/
│   │   ├── Note.js                 # Note schema (text, userId)
│   │   └── User.js                 # User schema (username, password)
│   ├── routes/
│   │   ├── auth.js                 # Register & Login endpoints
│   │   └── notes.js                # CRUD endpoints for notes
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT verification middleware
│   ├── server.js                   # Express server entry point
│   ├── package.json                # Backend dependencies
│   ├── .env                        # Environment variables (gitignored)
│   └── .gitignore
│
├── frontend/                       # React Frontend
│   ├── public/
│   │   └── index.html              # HTML template with Google Fonts
│   ├── src/
│   │   ├── App.js                  # Main application component
│   │   ├── App.css                 # Application styles (glassmorphism)
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles
│   └── package.json                # Frontend dependencies
│
├── Dockerfile                      # Multi-stage Docker build
├── Docker-compose.yml              # Docker Compose config
├── Jenkinsfile                     # CI/CD pipeline (with Docker push)
├── Jenkinsfile-no-push             # CI/CD pipeline (without Docker push)
├── sonar-project.properties        # SonarCloud configuration
├── .dockerignore                   # Docker build exclusions
├── .gitignore                      # Git exclusions
└── README.md
```

---

## 5. Backend Implementation

### 5.1 Server Entry Point (`server.js`)

The Express server is the core of the backend:

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(cors());                                    // Enable CORS
app.use(express.json());                            // Parse JSON bodies

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// API Routes
app.use("/auth", require("./routes/auth"));         // Auth routes (public)
app.use("/notes", require("./routes/notes"));       // Notes routes (protected)

// Serve React build as static files
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback — serve index.html for all non-API routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**Key Design Decisions:**
- CORS is enabled for cross-origin requests during development
- The React build output is served as static files from the `/public` directory
- SPA fallback ensures client-side routing works correctly
- Environment variables are loaded via `dotenv`

---

### 5.2 Database Models

#### User Model (`models/User.js`)

```javascript
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,      // Prevents duplicate usernames
        trim: true,         // Removes whitespace
        lowercase: true     // Normalizes to lowercase
    },
    password: {
        type: String,
        required: true      // Stores bcrypt hash, NOT plain text
    }
}, {
    timestamps: true        // Auto-generates createdAt, updatedAt
});
```

#### Note Model (`models/Note.js`)

```javascript
const NoteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",       // Foreign key reference to User
        required: true      // Every note must belong to a user
    }
}, {
    timestamps: true
});
```

---

### 5.3 Authentication System

#### How Registration Works (`POST /auth/register`)

```
Client sends: { username: "john", password: "mypass123" }
                           │
                           ▼
              ┌─── Validate inputs (non-empty, password ≥ 4 chars)
              │
              ▼
   Check if username exists in DB ──→ YES → Return 409: "Username already exists"
              │
              NO
              ▼
   Hash password with bcrypt (10 salt rounds)
   "mypass123" → "$2a$10$xK8f...long_hash..."
              │
              ▼
   Save to MongoDB: { username: "john", password: "$2a$10$..." }
              │
              ▼
   Generate JWT token (valid for 7 days)
   Payload: { userId: "...", username: "john" }
              │
              ▼
   Return: { token: "eyJhbG...", username: "john" }
```

#### How Login Works (`POST /auth/login`)

```
Client sends: { username: "john", password: "mypass123" }
                           │
                           ▼
   Find user by username in DB ──→ NOT FOUND → Return 401: "Invalid username or password"
              │
              FOUND
              ▼
   Compare password with stored hash using bcrypt
   bcrypt.compare("mypass123", "$2a$10$xK8f...") ──→ NO MATCH → Return 401
              │
              MATCH
              ▼
   Generate JWT token (valid for 7 days)
              │
              ▼
   Return: { token: "eyJhbG...", username: "john" }
```

#### Password Security with bcrypt

```
Plain password: "mypass123"

bcrypt.genSalt(10)          → Generates a random salt with 10 rounds
bcrypt.hash(password, salt) → "$2a$10$xK8fLk3mR7ePq9Hs5tYz.OkP8jN2vB4mX6wL1rC3dF5gH7iJ9kL"
                                │    │
                                │    └─ 10 rounds (cost factor)
                                └─ bcrypt algorithm identifier

The hash is IRREVERSIBLE — you cannot get "mypass123" back from the hash.
Login compares by re-hashing the input and comparing hashes.
```

---

### 5.4 JWT Authentication Middleware

```javascript
const authMiddleware = (req, res, next) => {
    // 1. Extract token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied" });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token using JWT_SECRET
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;       // Attach userId to request
        req.username = decoded.username;   // Attach username to request
        next();                            // Proceed to route handler
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
```

**How it protects routes:**
```
Client Request → Authorization Header → Middleware → Route Handler → Response
                         │
                    Has Bearer token?
                    NO → 401 Unauthorized
                    YES → Verify JWT
                           │
                      Valid token?
                      NO → 401 Invalid token
                      YES → Extract userId → Proceed
```

---

### 5.5 Notes API (Protected Routes)

All notes routes require authentication via the JWT middleware.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/notes` | Fetch all notes for logged-in user | ✅ |
| `POST` | `/notes` | Create a new note | ✅ |
| `DELETE` | `/notes/:id` | Delete a note (only if owned by user) | ✅ |
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login existing user | ❌ |

**Per-user data isolation:**
```javascript
// Only returns notes belonging to the authenticated user
router.get("/", async (req, res) => {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
});

// Attaches userId when creating a note
router.post("/", async (req, res) => {
    const newNote = new Note({
        text: req.body.text,
        userId: req.userId    // From JWT middleware
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
});

// Only deletes if the note belongs to the authenticated user
router.delete("/:id", async (req, res) => {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ error: "Note not found" });
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
});
```

---

## 6. Frontend Implementation

### 6.1 Application State Management

The frontend uses React's `useState` hook for state management:

```javascript
// Auth state
const [token, setToken] = useState(localStorage.getItem("token") || "");
const [username, setUsername] = useState(localStorage.getItem("username") || "");
const [isLogin, setIsLogin] = useState(true);           // Toggle login/register
const [authError, setAuthError] = useState("");          // Error messages

// Notes state
const [text, setText] = useState("");                    // Note input
const [notes, setNotes] = useState([]);                  // All user's notes
const [loading, setLoading] = useState(true);            // Loading spinner
```

**Session persistence:** Token and username are stored in `localStorage` so the user stays logged in even after closing the browser. On page load, the app checks `localStorage` — if a token exists, it skips the login page.

### 6.2 Authentication Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   App Loads       │     │   Login/Register  │     │   Notes Page     │
│                   │     │   Page            │     │                  │
│   Check localStorage    │                  │     │   Top Bar        │
│   for token       │     │   Username input  │     │   (avatar +     │
│                   │     │   Password input  │     │    username +   │
│   Token exists? ──┼─YES─┼──────────────────┼────▶│    logout btn)  │
│        │          │     │   Submit button   │     │                  │
│        NO         │     │   Toggle link     │     │   Composer       │
│        │          │     │   Error toast     │     │   Note cards     │
│        ▼          │     │                   │     │                  │
│   Show Auth Page ─┼────▶│   On Success: ────┼────▶│   On 401: ──────┼──┐
│                   │     │   Store token     │     │   Auto logout   │  │
└──────────────────┘     │   in localStorage │     │                  │  │
                          └──────────────────┘     └──────────────────┘  │
                                    ▲                                     │
                                    └─────────────────────────────────────┘
```

### 6.3 UI Design — Premium Dark Glassmorphism Theme

The frontend features a premium dark theme with:

- **Animated background:** 3 floating gradient orbs with CSS animations
- **Glassmorphism cards:** `backdrop-filter: blur()` with semi-transparent backgrounds
- **Gradient text:** Purple-blue-indigo gradient on the logo
- **Micro-animations:** Slide-in notes, hover effects, focus glow
- **Color palette:**
  - Background: `#0a0a12` (deep dark)
  - Primary: `#6366f1` → `#8b5cf6` (indigo-purple gradient)
  - Text: `#e4e4ef` (soft white)
  - Danger: `#f87171` (red for delete)
  - Borders: `rgba(255, 255, 255, 0.08)` (subtle glass edges)

---

## 7. CI/CD Pipeline (Jenkins)

### 7.1 Pipeline Architecture

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Clone    │───▶│ SonarCloud│───▶│  OWASP   │───▶│ Publish  │───▶│  Build   │───▶│   Push   │
│  Repo     │    │ Analysis  │    │  Dep     │    │  OWASP   │    │  Docker  │    │  Docker  │
│           │    │           │    │  Scan    │    │  Report  │    │  Image   │    │  Image   │
│  git clone│    │  Static   │    │  Security│    │  HTML    │    │  docker  │    │  docker  │
│  main     │    │  Analysis │    │  Vulns   │    │  Report  │    │  build   │    │  push    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 7.2 Jenkinsfile Stages

```groovy
pipeline {
    agent any

    environment {
        IMAGE_NAME = "devnotes"
        DOCKERHUB = "ritheshhebbar"
    }

    stages {
        // Stage 1: Clone the GitHub repository
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/ritheshhebbar/devnotes-ci-cd.git'
            }
        }

        // Stage 2: Run SonarCloud static code analysis
        stage('SonarCloud Analysis') {
            steps {
                bat 'sonar-scanner.bat'
            }
        }

        // Stage 3: OWASP Dependency vulnerability scan
        stage('OWASP Dependency Scan') {
            steps {
                bat 'dependency-check.bat --scan . --format HTML'
            }
        }

        // Stage 4: Publish OWASP HTML report in Jenkins
        stage('Publish OWASP Report') {
            steps {
                publishHTML(target: [
                    reportDir: '.',
                    reportFiles: 'dependency-check-report.html',
                    reportName: 'OWASP Report'
                ])
            }
        }

        // Stage 5: Build Docker image
        stage('Build Docker Image') {
            steps {
                bat 'docker build -t ritheshhebbar/devnotes .'
            }
        }

        // Stage 6: Push Docker image to Docker Hub
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                    bat 'docker push ritheshhebbar/devnotes'
                }
            }
        }
    }
}
```

### 7.3 Pipeline Stages Explained

| Stage | Tool | Purpose |
|-------|------|---------|
| **Clone Repository** | Git | Pulls latest code from `main` branch on GitHub |
| **SonarCloud Analysis** | SonarScanner | Static code analysis — detects bugs, code smells, security vulnerabilities, and code duplication |
| **OWASP Dependency Scan** | OWASP Dependency-Check | Scans all project dependencies (npm packages) against the NVD (National Vulnerability Database) for known CVEs |
| **Publish OWASP Report** | Jenkins HTML Publisher | Makes the vulnerability report accessible in Jenkins UI |
| **Build Docker Image** | Docker | Packages the entire application (frontend + backend) into a Docker container |
| **Push Docker Image** | Docker Hub | Pushes the built image to Docker Hub container registry |

---

## 8. Docker Containerization

### 8.1 Dockerfile

```dockerfile
FROM node:18                              # Base image: Node.js 18

WORKDIR /app

COPY frontend ./frontend                  # Copy frontend source
COPY backend ./backend                    # Copy backend source

# Build React frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build                         # Creates optimized production build

# Setup backend
WORKDIR /app/backend
RUN npm install

# Serve React from backend
RUN mkdir -p public
RUN cp -r /app/frontend/build/* /app/backend/public/   # Copy React build to Express static folder

EXPOSE 5000                               # Expose backend port

CMD ["node", "server.js"]                 # Start Express server
```

**Build strategy:** The Dockerfile uses a single-container approach where the React frontend is built during the Docker build process, and the compiled static files are served by the Express.js backend. This means:

- Only **one container** runs in production
- Express serves both the API and the React SPA
- Port **5000** is the only exposed port

### 8.2 Docker Build Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  npm install  │────▶│  npm run     │────▶│  Copy build  │
│  (frontend)   │     │  build       │     │  to backend  │
│               │     │  (React)     │     │  /public     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  npm install  │────▶│  EXPOSE      │────▶│  CMD: node   │
│  (backend)    │     │  5000        │     │  server.js   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 9. Code Quality — SonarCloud

### Configuration (`sonar-project.properties`)

```properties
sonar.projectKey=ritheshhebbar_devnotes-ci-cd
sonar.organization=k-s-rithesh-hebbar
sonar.projectName=DevNotes
sonar.sources=backend,frontend/src
sonar.host.url=https://sonarcloud.io
```

**What SonarCloud checks:**
- **Bugs** — Logic errors that could cause unexpected behavior
- **Code Smells** — Maintainability issues and bad practices
- **Security Vulnerabilities** — Potential security weaknesses
- **Code Duplication** — Repeated code blocks
- **Test Coverage** — Percentage of code covered by tests

---

## 10. Security — OWASP Dependency Check

The OWASP Dependency-Check tool scans all npm packages in the project and cross-references them against the **National Vulnerability Database (NVD)** to find known security vulnerabilities (CVEs).

**What it scans:**
- `package.json` and `package-lock.json` in both frontend and backend
- All transitive (nested) dependencies
- Reports critical, high, medium, and low severity vulnerabilities

**Output:** An HTML report (`dependency-check-report.html`) published to Jenkins for review.

---

## 11. Deployment Architecture

```
┌────────────────┐        ┌────────────────┐        ┌────────────────┐
│   Developer    │  push  │    GitHub       │  auto  │    Render      │
│   Machine      │───────▶│    Repository   │───────▶│    Cloud       │
│                │        │    (main)       │ deploy │    Platform    │
│  Code changes  │        │                │        │                │
│  git push      │        │  Triggers:     │        │  Builds app    │
│                │        │  - Render auto │        │  Serves on     │
│                │        │    deploy      │        │  port 5000     │
│                │        │  - Jenkins     │        │                │
│                │        │    webhook     │        │  URL:          │
└────────────────┘        └────────────────┘        │  devnotes-ci-  │
                                   │                │  cd.onrender   │
                                   │                │  .com          │
                                   ▼                └────────────────┘
                          ┌────────────────┐                │
                          │    Jenkins      │                │
                          │    Server       │                ▼
                          │                │        ┌────────────────┐
                          │  1. Clone      │        │  MongoDB Atlas │
                          │  2. SonarCloud │        │  Cloud DB      │
                          │  3. OWASP Scan │        │                │
                          │  4. Docker     │        │  Collections:  │
                          │     Build      │        │  - users       │
                          │  5. Docker     │        │  - notes       │
                          │     Push       │        │                │
                          └────────────────┘        └────────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │  Docker Hub    │
                          │                │
                          │  ritheshhebbar │
                          │  /devnotes     │
                          └────────────────┘
```

---

## 12. Environment Variables

| Variable | Where Set | Purpose |
|----------|-----------|---------|
| `MONGO_URI` | Render Dashboard + `.env` | MongoDB Atlas connection string |
| `JWT_SECRET` | Render Dashboard + `.env` | Secret key for signing JWT tokens |
| `PORT` | `.env` (default: 5000) | Server listening port |

> **Security Note:** The `.env` file is listed in `.gitignore` and is never committed to GitHub. Environment variables must be set manually in the Render dashboard for production.

---

## 13. API Reference

### Authentication Endpoints

#### `POST /auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john",
  "password": "mypass123"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "john"
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "Username and password are required" }` | Missing fields |
| 400 | `{ "error": "Password must be at least 4 characters" }` | Short password |
| 409 | `{ "error": "Username already exists" }` | Duplicate username |

---

#### `POST /auth/login`

Authenticate an existing user.

**Request Body:**
```json
{
  "username": "john",
  "password": "mypass123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "john"
}
```

**Error Responses:**
| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "error": "Username and password are required" }` | Missing fields |
| 401 | `{ "error": "Invalid username or password" }` | Wrong credentials |

---

### Notes Endpoints (Requires `Authorization: Bearer <token>`)

#### `GET /notes`
Returns all notes belonging to the authenticated user, sorted by newest first.

**Response (200):**
```json
[
  {
    "_id": "665a...",
    "text": "My first note",
    "userId": "664b...",
    "createdAt": "2026-06-07T08:30:00.000Z",
    "updatedAt": "2026-06-07T08:30:00.000Z"
  }
]
```

#### `POST /notes`
Create a new note for the authenticated user.

**Request Body:**
```json
{
  "text": "This is my new note"
}
```

**Response (201):** The created note object.

#### `DELETE /notes/:id`
Delete a note by ID (only if it belongs to the authenticated user).

**Response (200):**
```json
{ "message": "Note deleted" }
```

**Error Response (404):**
```json
{ "error": "Note not found" }
```

---

## 14. How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ritheshhebbar/devnotes-ci-cd.git
cd devnotes-ci-cd

# 2. Setup backend
cd backend
npm install

# 3. Create .env file in backend/
# Add:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# 4. Start backend
npm run dev          # Uses nodemon for auto-reload

# 5. In a new terminal, setup frontend
cd frontend
npm install
npm start            # Opens at http://localhost:3000

# 6. Or build and run via Docker
docker build -t devnotes .
docker run -p 5000:5000 --env-file backend/.env devnotes
```

---

## 15. Live URLs

| Resource | URL |
|----------|-----|
| **Live Application** | https://devnotes-ci-cd.onrender.com |
| **GitHub Repository** | https://github.com/ritheshhebbar/devnotes-ci-cd |
| **Docker Hub Image** | https://hub.docker.com/r/ritheshhebbar/devnotes |
| **SonarCloud Dashboard** | https://sonarcloud.io/project/overview?id=ritheshhebbar_devnotes-ci-cd |

---

## 16. Summary

DevNotes demonstrates a complete full-stack application with an end-to-end DevOps pipeline:

1. **Application Layer:** React frontend + Express.js backend + MongoDB Atlas
2. **Security:** bcrypt password hashing, JWT authentication, per-user data isolation, OWASP dependency scanning
3. **Code Quality:** SonarCloud static analysis for bugs, smells, and vulnerabilities
4. **Containerization:** Docker packaging with single-container deployment strategy
5. **CI/CD:** Jenkins pipeline automating code quality checks, security scans, Docker builds, and Docker Hub pushes
6. **Cloud Deployment:** Render with auto-deploy from GitHub and environment variable management

---

*Document generated for DevNotes CI/CD Project — June 2026*
