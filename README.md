# Express.js API Boilerplate on Vercel

A minimal Express.js backend template, fully compatible with Vercel (serverless).  
Includes modern middleware, ESM support, Swagger (OpenAPI 3) documentation, and environment variables via dotenv.

---

## Features

- **Express.js** with ESM syntax
- **Centralized middleware**: logging, error handling, request ID, authorization
- **Swagger UI** auto-generated API documentation (`/api-docs`)
- **.env** environment variable support (dotenv)
- **Ready for local development and Vercel deployment**

---

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

•	Copy .env.example to .env and fill in required values.

### 4. Run locally with Vercel CLI
```bash
npm install vercel
vercel dev
```

The API will be available at http://localhost:3000

Swagger docs: http://localhost:3000/api-docs

