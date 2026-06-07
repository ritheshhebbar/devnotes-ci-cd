# DevNotes — CI/CD Pipeline Project Writeup

---

## 1. Problem Statement

### 1.1 Background

In today's fast-paced software development landscape, the gap between writing code and delivering it to end users has become a critical bottleneck. Traditional software delivery processes are manual, error-prone, and time-consuming. Developers write code, manually test it, manually build it, manually check for security vulnerabilities, and manually deploy it to servers. Each of these manual steps introduces the risk of human error, inconsistency, and significant delays.

Moreover, modern web applications face several challenges that manual processes cannot adequately address:

- **Code Quality Degradation:** Without automated code analysis, bugs, code smells, and poor coding practices accumulate over time, leading to technical debt that becomes increasingly expensive to fix.
- **Security Vulnerabilities:** Open-source dependencies (npm packages) frequently contain known security vulnerabilities (CVEs). Without automated scanning, these vulnerabilities go undetected, exposing applications and user data to potential attacks.
- **Inconsistent Environments:** When developers say "it works on my machine," it highlights the problem of environment inconsistency between development, testing, and production environments.
- **Slow Release Cycles:** Manual build, test, and deploy processes can take hours or even days, slowing down the delivery of new features and critical bug fixes to users.
- **Lack of User Data Isolation:** Many simple applications store all data in a shared space without proper authentication, meaning any user can access, modify, or delete another user's data.

### 1.2 Problem Definition

The project aims to solve the following core problems:

1. **Application Problem:** Build a secure, full-stack note-taking application (**DevNotes**) where developers can register, login, and manage their personal notes. Each user's data must be completely isolated — no user should be able to see, edit, or delete another user's notes. Passwords must be securely hashed and never stored in plain text.

2. **DevOps Problem:** Implement a complete **CI/CD (Continuous Integration / Continuous Delivery) pipeline** using industry-standard tools that automates the entire software delivery lifecycle — from code commit to container deployment — including automated code quality analysis, security vulnerability scanning, Docker containerization, and image registry publishing.

### 1.3 Objectives

| # | Objective | Description |
|---|-----------|-------------|
| 1 | Build a full-stack web application | React frontend + Express.js backend + MongoDB database |
| 2 | Implement user authentication | Register/Login with bcrypt password hashing and JWT tokens |
| 3 | Ensure per-user data isolation | Each user can only access their own notes |
| 4 | Automate code quality checks | Use SonarCloud for static code analysis |
| 5 | Automate security scanning | Use OWASP Dependency-Check for vulnerability detection |
| 6 | Containerize the application | Package the app using Docker for consistent deployments |
| 7 | Automate the entire pipeline | Use Jenkins to orchestrate all stages automatically |
| 8 | Deploy to the cloud | Host on Render with auto-deploy from GitHub |

### 1.4 Scope

- The application is a **web-based notes manager** accessible via browser.
- Authentication is username/password based with JWT session tokens.
- The CI/CD pipeline runs on a **local Jenkins server** (Windows environment).
- Docker images are pushed to **Docker Hub** (public container registry).
- The production application is deployed on **Render** (cloud PaaS).
- The database is hosted on **MongoDB Atlas** (cloud DBaaS).

---

## 2. Technology Stack

### 2.1 Application Technologies

| Technology | Version | Layer | Role |
|-----------|---------|-------|------|
| **React** | 19.2 | Frontend | Single Page Application framework for building the user interface |
| **JavaScript (ES6+)** | — | Full-stack | Programming language used across frontend and backend |
| **Express.js** | 5.2 | Backend | Lightweight Node.js web framework for building REST APIs |
| **Node.js** | 18 | Runtime | Server-side JavaScript runtime environment |
| **MongoDB Atlas** | 7.x | Database | Cloud-hosted NoSQL document database for storing users and notes |
| **Mongoose** | 7.8 | ORM/ODM | Object Data Modeling library for MongoDB and Node.js |
| **Axios** | 1.16 | HTTP Client | Promise-based HTTP client for making API calls from React |
| **bcryptjs** | — | Security | Library for hashing passwords using the bcrypt algorithm |
| **jsonwebtoken (JWT)** | — | Auth | Library for creating and verifying JSON Web Tokens |
| **dotenv** | 17.4 | Config | Loads environment variables from `.env` files |
| **CORS** | 2.8 | Middleware | Enables Cross-Origin Resource Sharing for API access |

### 2.2 DevOps Technologies

| Technology | Role | Purpose |
|-----------|------|---------|
| **Jenkins** | CI/CD Orchestrator | Automates the entire build-test-deploy pipeline |
| **Docker** | Containerization | Packages the application into a portable, consistent container |
| **Docker Hub** | Container Registry | Stores and distributes Docker images |
| **SonarCloud** | Code Quality | Performs static code analysis to detect bugs, code smells, and vulnerabilities |
| **OWASP Dependency-Check** | Security Scanner | Scans dependencies for known CVEs from the National Vulnerability Database |
| **GitHub** | Version Control | Source code management and collaboration |
| **Render** | Cloud Hosting | Platform-as-a-Service for deploying the application |
| **MongoDB Atlas** | Cloud Database | Database-as-a-Service for production data |

---

## 3. CI/CD Pipeline

### 3.1 What is CI/CD?

**Continuous Integration (CI)** is the practice of automatically building, testing, and analyzing code every time a developer pushes changes to the repository. It ensures that new code integrates cleanly with the existing codebase.

**Continuous Delivery (CD)** extends CI by automatically packaging the application into deployable artifacts (like Docker images) and pushing them to registries, ready for deployment.

Together, CI/CD eliminates manual, error-prone processes and enables teams to deliver software faster, more reliably, and with higher quality.

### 3.2 Pipeline Tool: Jenkins

**Jenkins** is an open-source automation server that enables developers to build, test, and deploy software through configurable pipelines. It is the most widely used CI/CD tool in the industry.

- **Why Jenkins?** — Open-source, extensible with 1,800+ plugins, supports declarative pipelines via `Jenkinsfile`, and integrates with Docker, SonarCloud, and OWASP tools.
- **How it's triggered:** Jenkins monitors the GitHub repository. When code is pushed to the `main` branch, the pipeline executes automatically.
- **Pipeline definition:** The pipeline is defined as code in the `Jenkinsfile` stored in the repository root.

### 3.3 Pipeline Diagram

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 │                              JENKINS CI/CD PIPELINE                                        │
 │                                                                                             │
 │   Developer pushes code to GitHub (main branch)                                            │
 │         │                                                                                   │
 │         ▼                                                                                   │
 │   ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌──────────────────┐  │
 │   │  STAGE 1  │    │  STAGE 2  │    │  STAGE 3  │    │  STAGE 4  │    │    STAGE 5       │  │
 │   │           │    │           │    │           │    │           │    │                  │  │
 │   │   Clone   │───▶│  Sonar-   │───▶│   OWASP   │───▶│   Build   │───▶│  Push Docker     │  │
 │   │   Repo    │    │  Cloud    │    │   Dep     │    │  Docker   │    │  Image to        │  │
 │   │           │    │  Analysis │    │   Check   │    │  Image    │    │  Docker Hub      │  │
 │   │  GitHub   │    │           │    │           │    │           │    │                  │  │
 │   │  → Local  │    │  Static   │    │  Security │    │  Package  │    │  ritheshhebbar/  │  │
 │   │           │    │  Code     │    │  Vuln     │    │  App in   │    │  devnotes        │  │
 │   │           │    │  Analysis │    │  Scan     │    │  Container│    │                  │  │
 │   └───────────┘    └───────────┘    └───────────┘    └───────────┘    └──────────────────┘  │
 │        │                │                │                │                  │               │
 │        ▼                ▼                ▼                ▼                  ▼               │
 │   Source code      Quality Gate     OWASP HTML       Docker Image      Image available      │
 │   on Jenkins       Report on        Report on        built locally     on Docker Hub        │
 │   workspace        SonarCloud       Jenkins UI       (ritheshhebbar    for deployment       │
 │                    dashboard                          /devnotes)                             │
 └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Pipeline Stages — Detailed Explanation

---

#### Stage 1: Clone Repository

```groovy
stage('Clone Repository') {
    steps {
        git branch: 'main',
        url: 'https://github.com/ritheshhebbar/devnotes-ci-cd.git'
    }
}
```

| Attribute | Detail |
|-----------|--------|
| **Tool Used** | Git |
| **What It Does** | Clones the latest source code from the `main` branch of the GitHub repository into the Jenkins workspace. This ensures the pipeline always works with the most up-to-date code. |
| **Why It's Needed** | Jenkins needs a local copy of the source code to perform analysis, scanning, and building. Without this stage, no subsequent stage can function. |
| **Outcome** | The complete project source code (frontend, backend, Dockerfile, config files) is available locally on the Jenkins server for processing by subsequent stages. |

---

#### Stage 2: SonarCloud Analysis

```groovy
stage('SonarCloud Analysis') {
    steps {
        bat 'sonar-scanner.bat'
    }
}
```

| Attribute | Detail |
|-----------|--------|
| **Tool Used** | SonarScanner CLI + SonarCloud (cloud-hosted SonarQube) |
| **What It Does** | Runs static code analysis on the entire codebase (both `backend/` and `frontend/src/`). The SonarScanner reads the `sonar-project.properties` file for configuration, scans all source files, and uploads the results to the SonarCloud dashboard. |
| **Why It's Needed** | Static analysis catches issues that manual code review often misses — logic bugs, security hotspots, code duplication, and maintainability problems. It enforces code quality standards automatically, preventing poor code from reaching production. |
| **What SonarCloud Detects** | • **Bugs** — Logic errors that will cause incorrect behavior at runtime |
| | • **Code Smells** — Maintainability issues that make code harder to understand and modify |
| | • **Security Vulnerabilities** — Code patterns that could be exploited by attackers |
| | • **Security Hotspots** — Code that needs manual security review |
| | • **Code Duplication** — Repeated code blocks that should be refactored |
| **Configuration** | Defined in `sonar-project.properties`: project key, organization, source directories, and SonarCloud host URL |
| **Outcome** | A detailed quality report is generated on the SonarCloud dashboard (https://sonarcloud.io), showing the overall health of the codebase with ratings for reliability, security, and maintainability. |

---

#### Stage 3: OWASP Dependency Check

```groovy
stage('OWASP Dependency Scan') {
    steps {
        bat 'dependency-check.bat --scan . --format HTML'
    }
}
```

| Attribute | Detail |
|-----------|--------|
| **Tool Used** | OWASP Dependency-Check (v12.2.2) |
| **What It Does** | Scans all project dependencies (npm packages listed in `package.json` and `package-lock.json`) and cross-references them against the **National Vulnerability Database (NVD)** maintained by NIST. It identifies any known security vulnerabilities (CVEs — Common Vulnerabilities and Exposures) in the project's third-party libraries. |
| **Why It's Needed** | Modern applications rely heavily on open-source libraries. A single vulnerable dependency can compromise the entire application. For example, a vulnerability in a JSON parsing library could allow an attacker to execute arbitrary code on the server. OWASP Dependency-Check automates the detection of such risks. |
| **What It Scans** | • `package.json` — Direct dependencies |
| | • `package-lock.json` — All transitive (nested) dependencies |
| | • Both frontend and backend dependency trees |
| **Severity Levels** | Each vulnerability is rated: **Critical**, **High**, **Medium**, or **Low** based on the CVSS (Common Vulnerability Scoring System) score |
| **Outcome** | An HTML report (`dependency-check-report.html`) is generated listing all identified vulnerabilities with their CVE IDs, severity scores, affected packages, and recommended fixes. |

**The OWASP report is then published to Jenkins UI:**

```groovy
stage('Publish OWASP Report') {
    steps {
        publishHTML(target: [
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: '.',
            reportFiles: 'dependency-check-report.html',
            reportName: 'OWASP Report'
        ])
    }
}
```

This makes the vulnerability report accessible directly from the Jenkins build dashboard, allowing teams to review security findings without leaving the CI/CD tool.

---

#### Stage 4: Build Docker Image

```groovy
stage('Build Docker Image') {
    steps {
        bat 'docker build -t ritheshhebbar/devnotes .'
    }
}
```

| Attribute | Detail |
|-----------|--------|
| **Tool Used** | Docker Engine |
| **What It Does** | Reads the `Dockerfile` in the project root and builds a Docker image that packages the entire application (React frontend + Express.js backend) into a single, self-contained container. The build process: |
| | 1. Starts from the `node:18` base image |
| | 2. Copies frontend and backend source code |
| | 3. Installs frontend dependencies and builds the React app (`npm run build`) |
| | 4. Installs backend dependencies |
| | 5. Copies the React production build into the backend's `public/` folder |
| | 6. Configures the container to run `node server.js` on port 5000 |
| **Why It's Needed** | Docker solves the "it works on my machine" problem by packaging the application with all its dependencies, runtime, and configuration into a standardized unit. The same Docker image runs identically on any machine — developer laptop, CI server, or production cloud — eliminating environment inconsistencies. |
| **Image Name** | `ritheshhebbar/devnotes` (format: `dockerhub-username/image-name`) |
| **Outcome** | A Docker image is created locally on the Jenkins server, ready to be pushed to a container registry or deployed directly. |

---

#### Stage 5: Push Docker Image to Docker Hub

```groovy
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
```

| Attribute | Detail |
|-----------|--------|
| **Tool Used** | Docker CLI + Docker Hub |
| **What It Does** | Authenticates with Docker Hub using securely stored Jenkins credentials, then pushes the built Docker image to the Docker Hub container registry. Docker Hub is a cloud-based repository where Docker images are stored and distributed. |
| **Why It's Needed** | Once the image is on Docker Hub, it can be pulled and deployed by any server, cloud platform, or team member from anywhere in the world. It acts as the central distribution point for the application's deployable artifact. |
| **Security** | Docker Hub credentials are stored securely in Jenkins' credential store (not hardcoded in the Jenkinsfile). The `withCredentials` block injects them as environment variables only during this stage. |
| **Registry URL** | https://hub.docker.com/r/ritheshhebbar/devnotes |
| **Outcome** | The Docker image is publicly available on Docker Hub. Anyone can pull and run the application with a single command: `docker pull ritheshhebbar/devnotes` |

---

### 3.5 Pipeline Summary Table

| Stage | Tool | Input | Output | Purpose |
|-------|------|-------|--------|---------|
| 1. Clone Repo | Git | GitHub URL | Source code on Jenkins | Get the latest code |
| 2. SonarCloud | SonarScanner | Source code | Quality report on SonarCloud | Detect bugs, smells, vulnerabilities |
| 3. OWASP Scan | Dependency-Check | package.json, lock files | HTML vulnerability report | Detect insecure dependencies |
| 4. Build Image | Docker | Dockerfile + source | Local Docker image | Package app in container |
| 5. Push Image | Docker + Docker Hub | Local image | Image on Docker Hub | Distribute deployable artifact |

---

## 4. Deployment Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Developer   │  git    │   GitHub     │  auto-   │   Render     │
│  writes code │ push    │   (main      │  deploy  │   Cloud      │
│  locally     │────────▶│    branch)   │─────────▶│   Platform   │
│              │         │              │          │              │
│              │         │  Triggers:   │          │  Builds &    │
│              │         │  1. Render   │          │  deploys the │
│              │         │  2. Jenkins  │          │  application │
│              │         │              │          │              │
└──────────────┘         └──────┬───────┘          └──────┬───────┘
                                │                         │
                                ▼                         ▼
                        ┌──────────────┐         ┌──────────────┐
                        │   Jenkins    │         │  MongoDB     │
                        │   Pipeline   │         │  Atlas       │
                        │              │         │              │
                        │ SonarCloud   │         │  Cloud DB    │
                        │ OWASP Scan   │         │  stores      │
                        │ Docker Build │         │  users &     │
                        │ Docker Push  │         │  notes       │
                        │              │         │              │
                        └──────┬───────┘         └──────────────┘
                                │
                                ▼
                        ┌──────────────┐
                        │  Docker Hub  │
                        │              │
                        │  Stores the  │
                        │  container   │
                        │  image       │
                        └──────────────┘
```

**Deployment is triggered automatically** when code is pushed to the `main` branch on GitHub:

1. **Render** detects the new commit and auto-deploys the updated application
2. **Jenkins** detects the new commit and runs the full CI/CD pipeline (code quality → security scan → Docker build → Docker push)

Both processes run in parallel and independently.

---

## 5. Key Outcomes

| Outcome | How It's Achieved |
|---------|-------------------|
| **Automated Code Quality** | SonarCloud runs on every pipeline execution, ensuring no bugs or code smells reach production |
| **Automated Security** | OWASP scans every dependency against the NVD, catching vulnerable packages before they're deployed |
| **Consistent Deployments** | Docker ensures the application runs identically across all environments |
| **Fast Delivery** | The entire pipeline (clone → scan → build → push) runs automatically without manual intervention |
| **Secure Authentication** | bcrypt hashing + JWT tokens protect user accounts and sessions |
| **Data Privacy** | Per-user note isolation ensures users cannot access each other's data |
| **Cloud Scalability** | Render + MongoDB Atlas provide managed, scalable infrastructure |

---

*DevNotes CI/CD Pipeline Project — K S Rithesh Hebbar — June 2026*
