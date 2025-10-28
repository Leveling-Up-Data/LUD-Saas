# LUD-SaaS (Starfish)

A modern, full-stack SaaS application built with React, Express, and PocketBase. Features subscription management, Stripe payments, AI-powered chatbot, and comprehensive user management.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

### Core Features
- **User Authentication** - Secure authentication via PocketBase with email/password
- **Subscription Management** - Three-tier pricing (Starter, Professional, Enterprise)
- **Stripe Integration** - Complete payment processing and webhook handling
- **AI Chatbot** - Intelligent chatbot with file upload support (PDF, DOC, DOCX, TXT)
- **Email Notifications** - Automated emails for contacts and invitations
- **Responsive UI** - Modern, accessible design with dark mode support
- **API Token Management** - Generate and manage API tokens for integrations
- **Dashboard Analytics** - User dashboard with subscription details

### Technical Features
- **TypeScript** - Full type safety across frontend and backend
- **React Query** - Efficient data fetching and caching
- **Drizzle ORM** - Type-safe database queries (optional PostgreSQL)
- **Sentry Integration** - Error tracking and performance monitoring
- **Docker Support** - Containerized deployment
- **Cloud Run Ready** - Optimized for Google Cloud Run deployment
- **WebSocket Support** - Real-time communication capabilities

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture diagrams and system design.

**Tech Stack:**
- **Frontend:** React 18, TypeScript, Vite, Wouter, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, Node.js, TypeScript
- **Database:** PocketBase (primary), PostgreSQL with Drizzle ORM (optional)
- **Payment:** Stripe API
- **AI/ML:** n8n webhook integration for chatbot
- **Deployment:** Docker, Google Cloud Run
- **Monitoring:** Sentry

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Docker** (optional, for containerized deployment)
- **Google Cloud CLI** (optional, for Cloud Run deployment)
- **Git** for version control

### External Services

You'll need accounts for:
- **PocketBase** - [Sign up](https://pocketbase.io/) or self-host
- **Stripe** - [Create account](https://stripe.com/)
- **n8n** - For chatbot backend (optional)
- **Google Cloud** - For Cloud Run deployment (optional)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LUD-Saas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PocketBase

Follow the [POCKETBASE_SETUP.md](./POCKETBASE_SETUP.md) guide to:
- Create required collections (users, subscriptions, products, invitations)
- Configure authentication
- Set up custom hooks
- Add seed data

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Node Environment
NODE_ENV=development
PORT=8080

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (get from Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_starter_id
STRIPE_PROFESSIONAL_PRICE_ID=price_professional_id
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_id

# PocketBase Configuration (set in client code)
VITE_POCKETBASE_URL=https://pb.levelingupdata.com

# n8n Chatbot Webhook (optional)
VITE_N8N_WEBHOOK_URL=https://n8n.levelingupdata.com/webhook/starfish

# Sentry Configuration (optional)
SENTRY_DSN=your_sentry_dsn

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 5. Build the Application

```bash
# Build client
npm run build:client

# Or build everything
npm run build
```

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

This starts:
- Frontend dev server with HMR on `http://localhost:5173`
- Backend API server on `http://localhost:8080`
- Vite proxy for API requests

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:client` | Build client only |
| `npm start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema (Drizzle) |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |

### Development Workflow

1. **Frontend Development**
   - Edit files in `client/src/`
   - Changes auto-reload with HMR
   - Component library: shadcn/ui components in `client/src/components/ui/`

2. **Backend Development**
   - Edit files in `server/`
   - API routes in `server/routes.ts`
   - Server auto-restarts on changes (tsx watch mode)

3. **Shared Types**
   - Edit database schema in `shared/schema.ts`
   - Types are shared between frontend and backend

## 🌐 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t lud-saas .

# Run container
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e STRIPE_SECRET_KEY=your_key \
  lud-saas
```

### Google Cloud Run Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Cloud Run deployment instructions.

**Quick Deploy:**

```bash
# Set project ID
export PROJECT_ID=your-project-id

# Run deployment script
./deploy.sh
```

### Custom Domain Setup

See [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md) for configuring custom domains.

## 📁 Project Structure

```
LUD-Saas/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       │   ├── ui/       # shadcn/ui components
│       │   ├── chatbot.tsx
│       │   ├── navbar.tsx
│       │   └── ...
│       ├── pages/        # Page components
│       ├── lib/          # Utilities and context
│       ├── hooks/        # Custom React hooks
│       └── config/       # Configuration files
├── server/                # Backend Express application
│   ├── index.ts          # Main server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   ├── vite.ts           # Vite dev server integration
│   └── types/            # TypeScript type definitions
├── shared/                # Shared code between client/server
│   └── schema.ts         # Database schema and types
├── pocketbase-hooks/      # PocketBase custom hooks
│   ├── create-subscription.js
│   ├── stripe-webhook.js
│   └── users-tokens-generate.js
├── docs/                  # Documentation
├── dist/                  # Build output
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose (if needed)
├── cloudbuild.yaml       # Google Cloud Build config
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

## 📚 API Documentation

### Authentication Endpoints

**Note:** Authentication is handled by PocketBase. See PocketBase SDK documentation.

### Core API Endpoints

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/products`
Get all subscription products/plans.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Starter",
    "price": 1900,
    "features": ["Up to 1,000 users", "5GB storage", ...],
    "maxUsers": 1000,
    "storage": "5GB",
    "priority": 1
  }
]
```

#### `POST /api/send-contact-email`
Send contact form email.

**Request:**
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Hello..."
}
```

#### `POST /api/send-invite-email`
Send invitation email.

**Request:**
```json
{
  "email": "friend@example.com"
}
```

#### `POST /api/webhook`
Stripe webhook handler (internal use).

### PocketBase API

PocketBase provides RESTful API endpoints:
- `POST /api/collections/users/auth-with-password` - Login
- `POST /api/collections/users/records` - Register
- `GET /api/collections/products/records` - Get products
- `GET /api/collections/subscriptions/records` - Get subscriptions

See [PocketBase API docs](https://pocketbase.io/docs/api-records/) for full reference.

## 🧪 Testing

```bash
# Run type checking
npm run check

# Linting (if configured)
npm run lint
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components with Tailwind CSS. All components are in `client/src/components/ui/`.

### Key Components

- **Navbar** - Navigation with authentication state
- **Chatbot** - AI assistant with file upload
- **AuthModal** - Login/signup modal
- **PricingCard** - Subscription plan cards
- **Dashboard** - User dashboard with analytics
- **Profile** - User profile management

## 🔐 Security

- **Authentication:** PocketBase provides secure JWT-based auth
- **API Keys:** Stripe keys are server-side only
- **HTTPS:** Enforced in production
- **Input Validation:** Zod schemas for all inputs
- **CORS:** Configured for production domains
- **Error Handling:** Sentry integration for error tracking
- **Webhook Verification:** Stripe webhook signature verification

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use existing component patterns
- Add JSDoc comments for complex functions
- Test changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- **Documentation:** Check the `docs/` folder
- **Issues:** Open a GitHub issue
- **Email:** atom@levelingupdata.com
- **Website:** https://starfish.levelingupdata.com

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Express](https://expressjs.com/) - Backend framework
- [PocketBase](https://pocketbase.io/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment processing
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Sentry](https://sentry.io/) - Error tracking

## 📊 Project Status

**Current Version:** 1.0.0  
**Status:** Active Development  
**Production URL:** https://starfish.levelingupdata.com  
**PocketBase URL:** https://pb.levelingupdata.com

---

Built with ❤️ by the Leveling Up Data team

