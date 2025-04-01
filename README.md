Got it! Here's an updated version of the README, with a dedicated **Development Environment Startup** section and the updated PostgreSQL environment variable (`DATABASE_URL`) as requested.

---

# 📊 Sentiment Analysis and Summarization Platform

## 🚀 Overview

This project is a **comprehensive platform** that combines **sentiment analysis** and **text summarization** capabilities. It consists of multiple services working together to provide a seamless experience for analyzing and summarizing text data.

## 🏗️ Architecture

The platform follows a **microservices architecture** with the following components:

- **🗄️ PostgreSQL Database** – Stores all sentiment analysis data and user information.
- **🛠️ Backend API Server** – Handles business logic and database operations.
- **💻 Sentiment Analysis Client** – Frontend interface for users to interact with the system.
- **📜 Summarization API** – Specialized service for text summarization.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/) and Docker Compose
- [Git](https://git-scm.com/)

---

## 🏁 Getting Started

### 🔧 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KaluMiracle/sentiment-analysis-platform.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd sentiment-analyzer
   ```
3. **Start the services using Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   > 🕒 _The first build may take some time as dependencies are downloaded._

### 🌐 Accessing the Services

Once the services are up and running, you can access them at the following URLs:

| Service                  | URL                                            | Port |
| ------------------------ | ---------------------------------------------- | ---- |
| 🖥️ **Frontend Client**   | [http://localhost:3001](http://localhost:3001) | 3001 |
| 🔌 **Backend API**       | [http://localhost:3000](http://localhost:3000) | 3000 |
| ✂️ **Summarization API** | [http://localhost:8000](http://localhost:8000) | 8000 |

---

## 📦 Services

### 🗄️ PostgreSQL Database

- **Port:** `5432`
- **Credentials:**
  - **Username:** `postgres`
  - **Password:** `postgres`
  - **Database:** `sentiment`
- **Persistence:** Data is stored in a **Docker volume** for persistence between restarts.

### 🔌 Backend Server

- **Technology:** Node.js
- **API Port:** `3000`
- **Features:**
  - Sentiment analysis processing
  - User management
  - Data persistence via PostgreSQL
  - RESTful API endpoints

### 💻 Sentiment Analysis Client

- **Technology:** React.js
- **Port:** `3001`
- **Features:**
  - User-friendly interface for sentiment analysis
  - Real-time feedback
  - Visualization of sentiment data
  - Integration with the backend API

### 📜 Summarization API

- **Port:** `8000`
- **Features:**
  - Text summarization capabilities
  - RESTful API for summarization requests
  - Integration with the main platform

---

## 🛠️ Development Environment Setup

### 🖥️ Starting the Development Environment

To set up and start the development environment for all services, follow these steps:

1. **Clone the repository** (if you haven’t already):

   ```bash
   git clone https://github.com/yourusername/sentiment-analysis-platform.git
   cd sentiment-analysis-platform
   ```

2. **Create a `.env` file** in the root directory with the following variable:

   ```
   DATABASE_URL=postgres://postgres:postgres@postgres:5432/sentiment
   ```

3. **Start all services using Docker Compose in development mode**:

   ```bash
   docker-compose up --build
   ```

   > 🕒 _The `--build` flag ensures the services are rebuilt with any code changes you’ve made._

   This will build and start the required services for development. **Volume mounts** are used so code changes will reflect immediately within the containers.

### 🖥️ Accessing the Development Environment

Once the services are up, you can access them at:

| Service                  | URL                                            | Port |
| ------------------------ | ---------------------------------------------- | ---- |
| 🖥️ **Frontend Client**   | [http://localhost:3001](http://localhost:3001) | 3001 |
| 🔌 **Backend API**       | [http://localhost:3000](http://localhost:3000) | 3000 |
| ✂️ **Summarization API** | [http://localhost:8000](http://localhost:8000) | 8000 |

### 💻 Service Code Mounting for Development

The following code directories are mounted in the containers so that changes are immediately reflected:

| Service               | Code Mount Path            |
| --------------------- | -------------------------- |
| **Backend Server**    | `./sentiment-server:/app`  |
| **Frontend Client**   | `./sentiment-client:/app`  |
| **Summarization API** | `./summarization-api:/app` |

> **Note:** Node modules are excluded from volume mounts to prevent overwriting container dependencies.

---

## ⚙️ Environment Variables

| Service               | Environment Variable | Description               |
| --------------------- | -------------------- | ------------------------- |
| **PostgreSQL**        | `DATABASE_URL`       | PostgreSQL connection URL |
| **Backend Server**    | `DATABASE_URL`       | PostgreSQL connection URL |
| **Sentiment Client**  | `REACT_APP_API_URL`  | Backend API URL           |
| **Summarization API** | `PORT`               | API port                  |

---

## 🛑 Stopping the Services

To **stop all services**:

```bash
docker-compose down
```

To **stop and remove all data (including database volume)**:

```bash
docker-compose down -v
```

---
