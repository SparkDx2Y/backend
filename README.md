#  Spark — Backend API

> A modern, feature-rich REST API powering the **Spark** dating application. Built with Node.js, Express, TypeScript, MongoDB, and real-time WebSocket support via Socket.IO.

---

##  Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Real-Time Events](#real-time-events)
- [Scripts](#scripts)
- [Contributing](#contributing)

---

## Overview

Spark Backend is a scalable REST API and WebSocket server for a dating application. It handles user authentication, profile management, matchmaking, real-time messaging, notifications, subscriptions, payments, and admin management — all built using a clean architecture with Dependency Injection (InversifyJS).

---

## 🛠 Tech Stack

| Category         | Technology                                         |
|------------------|----------------------------------------------------|
| Runtime          | Node.js                                            |
| Language         | TypeScript                                         |
| Framework        | Express v5                                         |
| Database         | MongoDB (via Mongoose)                             |
| Cache            | Redis (via ioredis)                                |
| Real-time        | Socket.IO                                          |
| Authentication   | JWT, Google OAuth 2.0                              |
| File Storage     | Cloudinary                                         |
| Payments         | Stripe                                             |
| Email            | Resend                                             |
| Validation       | Zod                                                |
| DI Container     | InversifyJS                                        |
| Job Scheduling   | node-cron                                          |
| Logging          | Winston + winston-daily-rotate-file                |
| Linting          | ESLint + TypeScript-ESLint                         |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                  # Express app setup & middleware
│   ├── server.ts               # Server entry point (HTTP + Socket.IO)
│   ├── config/                 # Configuration (DB, Redis, JWT, Cloudinary, etc.)
│   ├── constants/              # App-wide constants
│   ├── controllers/            # Route controller logic
│   ├── di/                     # InversifyJS DI container setup
│   ├── dto/                    # Data Transfer Objects
│   ├── jobs/                   # Scheduled background jobs (node-cron)
│   ├── mapper/                 # Entity-to-DTO mappers
│   ├── middlewares/            # Express middlewares (auth, error handler, logger)
│   ├── models/                 # Mongoose data models
│   ├── repositories/           # Data access layer
│   ├── routes/                 # API route definitions
│   │   └── v1/                 # Versioned API routes (v1)
│   │       ├── auth/
│   │       ├── profile/
│   │       ├── match/
│   │       ├── message/
│   │       ├── notification/
│   │       ├── payment/
│   │       ├── report/
│   │       ├── subscription/
│   │       └── admin/
│   ├── seeds/                  # Database seeders
│   ├── service/                # Business logic layer
│   ├── socket/                 # Socket.IO event handlers
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── logs/                       # Application log files
├── .env                        # Environment variables (not committed)
├── .gitignore
├── eslint.config.js
├── nodemon.json
├── package.json
└── tsconfig.json
```

---

##  Features

- **Authentication** — JWT-based login/register, Google OAuth 2.0, refresh tokens via HTTP-only cookies
- **Profile Management** — Create, update, and view user dating profiles
- **Matchmaking** — Like/dislike actions, mutual match detection
- **Real-Time Messaging** — Socket.IO powered chat between matched users
- **Notifications** — In-app notification system
- **File Uploads** — Profile picture and media uploads via Cloudinary (Multer)
- **Subscriptions & Payments** — Stripe-powered subscription plans with webhook support
- **Admin Panel** — User management, reports, and platform controls
- **Reporting** — User reporting and content moderation flows
- **Background Jobs** — Scheduled tasks with node-cron
- **Structured Logging** — Daily rotating log files via Winston
- **Redis Caching** — Fast, in-memory caching with ioredis
- **Health Check** — `GET /health` endpoint for uptime monitoring

---

##  Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) >= 9.x
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Redis](https://redis.io/) (local or managed service)

---

### Installation

```bash
# Clone the repository
git clone https://github.com/SparkDx2Y/backend.git
cd backend

# Install dependencies
npm install
```

---

### Environment Variables

Create a `.env` file in the root of the `backend/` directory. Use the following as a reference:

```env
# Server
PORT=5000
NODE_ENV=development


# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

### Running the Server

```bash
# Development mode (with hot-reload via nodemon)
npm run dev

# Production build
npm run build
npm start
```

The server will start on `http://localhost:5000` by default.

---

## 📡 API Reference

All routes are prefixed with `/api/v1`.

| Module         | Base Path                  | Description                              |
|----------------|---------------------------|------------------------------------------|
| Auth           | `/api/v1/auth`             | Register, login, logout, Google OAuth    |
| Profile        | `/api/v1/profile`          | View and update user profiles            |
| Files          | `/api/v1/files`            | Upload profile images and media          |
| Match          | `/api/v1/match`            | Like, dislike, and view matches          |
| Messages       | `/api/v1/messages`         | Conversation and message management      |
| Notifications  | `/api/v1/notifications`    | Fetch and manage notifications           |
| Reports        | `/api/v1/reports`          | Submit and manage user reports           |
| Subscriptions  | `/api/v1/subscriptions`    | View and manage subscription plans       |
| Payments       | `/api/v1/payments`         | Stripe checkout, webhook, billing        |
| Admin          | `/api/v1/admin`            | Admin user and platform management       |

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-08-07T06:00:00.000Z"
}
```

---

## ⚡ Real-Time Events

The server exposes a **Socket.IO** endpoint for real-time communication. Connect to the server using the Socket.IO client library.

Key real-time features:
- **Chat Messaging** — Send and receive messages instantly between matched users
- **Notifications** — Push live notifications to users
- **Match Events** — Real-time match alerts

---

## 📜 Scripts

| Script            | Command               | Description                              |
|-------------------|-----------------------|------------------------------------------|
| Development       | `npm run dev`         | Start with hot-reload (nodemon)          |
| Build             | `npm run build`       | Compile TypeScript to `dist/`            |
| Production        | `npm start`           | Run compiled production server           |
| Seed Admin        | `npm run seed:admin`  | Seed the initial admin user              |
| Lint              | `npm run lint`        | Run ESLint checks                        |
| Lint & Fix        | `npm run lint:fix`    | Run ESLint and auto-fix issues           |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `develop`

---

> Made with  by **Achu** — Spark Development Team
