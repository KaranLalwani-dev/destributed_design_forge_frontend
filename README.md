# DesignForge Frontend

## Project Overview

DesignForge is an AI-powered system design platform that helps engineers create, visualize, and iterate on distributed system architectures. This repository contains the React + Vite frontend that interfaces with the DesignForge microservices backend.

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/41b69dd2-54e1-486e-8d81-fb695777fa2b" />

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/4ca80963-f097-48e7-a3fd-cfd7cdff348a" />

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/fd8b00cb-f8a0-49c0-8ecf-0a0002670d21" />

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/834e476c-b20f-402c-9fd5-deb79f3f0394" />

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/4873b610-5da4-4f68-88d5-f049c7b6e437" />

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/8dcdddeb-ed4f-4db5-bb5f-0f472df7e1e7" />

<img width="1710" height="1106" alt="image" src="https://github.com/user-attachments/assets/502e1bd0-9aee-455a-a21d-25e251f5c049" />

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/8b3d9266-33d7-4523-b651-838d53a39748" />

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/dd737952-a3fa-4351-bdad-724309dc586c" />

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
<img width="1710" height="942" alt="image" src="https://github.com/user-attachments/assets/d674f134-1c5f-44dd-8761-29eb274f9b8d" />
