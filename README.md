# StudyHub

StudyHub is a modern, premium student collaboration platform designed to help students study better together in real-time. It enables users to create study groups, participate in chat rooms, publish notice boards, share study materials, schedule meetings, initiate simulated video calls, and leverage a smart AI Study Assistant powered by Google Gemini.

---

## Architecture Overview

StudyHub is split into two main components:
- **Frontend (Client)**: Built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**. It includes a full multi-language localization context (supporting Hebrew and English out-of-the-box).
- **Backend (Server)**: Built with **Node.js (Express)**. It integrates with **Supabase** for database storage and **Google Generative AI (Gemini)** for natural language processing features.

---

## Prerequisites

Before running the application, make sure you have the following installed:
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18+ recommended, required for local running and testing)
- [npm](https://www.npmjs.com/) (usually bundles with Node)

---

## Environment Setup

Create a `.env` file at the root of the project (next to `docker-compose.yml`) containing the required API keys and connection parameters:

```env
SUPABASE_URL=https://<your-supabase-project-id>.supabase.co
SUPABASE_KEY=<your-supabase-service-role-key>
GEMINI_API_KEY=<your-google-gemini-api-key>
AGORA_APP_ID=<your-agora-app-id>
AGORA_APP_CERTIFICATE=<your-agora-app-certificate>
```

---

## Running the Project with Docker Compose

To build and run the entire stack (both client and server) automatically in isolated Docker containers:

1. **Start the containers**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - **Frontend (Client)**: Navigate to [http://localhost:5173](http://localhost:5173) in your browser.
   - **Backend (Server)**: The API server will be listening at [http://localhost:3001](http://localhost:3001).

3. **Stop the containers**:
   To stop and remove containers, networks, and volumes:
   ```bash
   docker-compose down
   ```

---

## Running the Project Locally (Alternative)

If you prefer to run the client and server locally without Docker:

### 1. Server Setup
```bash
cd server
npm install
npm run dev
```
The server will run on port `3001`.

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
The Vite development server will start on port `5173`.

---

## Running E2E Tests with Playwright

Playwright is used for end-to-end testing of the main user flows. The tests run against the active client server at `http://localhost:5173` and backend at `http://localhost:3001`.

### Pre-requisites for Testing
Ensure that both client and server are running (either via Docker Compose or locally) and install the Playwright browsers:
```bash
npx playwright install
```

### Running Tests

- **Run all E2E tests** (headless mode):
  ```bash
  npx playwright test
  ```

- **Run E2E tests on a specific browser** (e.g., Chromium):
  ```bash
  npx playwright test --project=chromium
  ```

- **Run E2E tests in Headed Mode** (displays the browser window during execution):
  ```bash
  npx playwright test --headed
  ```

- **Run E2E tests in Playwright Interactive UI Mode** (provides step snapshots, timelines, and live debugging):
  ```bash
  npx playwright test --ui
  ```
