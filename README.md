# DesignForge Frontend

## Project Overview

DesignForge is an AI-powered system design platform that helps engineers create, visualize, and iterate on distributed system architectures. This repository contains the React + Vite frontend that interfaces with the DesignForge microservices backend.

## Tech Stack

- **Vite** — build tool and dev server with HMR
- **React + TypeScript** — component framework
- **shadcn-ui** — component library
- **Tailwind CSS** — utility-first styling

## Backend Architecture

The frontend communicates with a distributed microservices backend built with:

- **Spring Boot + Spring Cloud** — core microservices
- **Spring Cloud Gateway** — API gateway and routing
- **PostgreSQL + pgvector** — relational data and vector embeddings
- **MinIO** — object storage
- **Redis** — caching and routing
- **Kafka** — event streaming
- **Google Gemini** — LLM-powered code and diagram generation (SSE streaming)
- **Kubernetes (kind)** — local orchestration

## Getting Started

### Prerequisites

- Node.js & npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- DesignForge backend services running (Docker Compose or Kubernetes)

### Local Development

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

The dev server starts with HMR enabled. Make sure the backend gateway is reachable (default: `http://localhost:8080`).

## Project Structure

src/

├── components/        Reusable UI components (shadcn-ui based)

├── pages/             Route-level page components

├── hooks/             Custom React hooks

├── lib/               Utilities and API clients

└── assets/            Static assets

## Connecting to the Backend

The frontend proxies API requests to the Spring Cloud Gateway. Update the base URL in your environment config:

```env
VITE_API_BASE_URL=http://localhost:8080
```

SSE streaming for AI-generated diagrams and code is handled via the `/stream` endpoints exposed by the gateway.

## Deployment

The frontend can be containerized and deployed alongside the backend services in the Kubernetes cluster. A `Dockerfile` should be added at the root for production builds:

```sh
npm run build
# Output goes to /dist — serve with nginx or deploy to your cluster
```
