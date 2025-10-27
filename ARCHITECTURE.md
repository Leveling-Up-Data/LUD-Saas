# LUD-SaaS Architecture Documentation

This document provides a comprehensive overview of the LUD-SaaS (Starfish) application architecture, including system design, data flow, and deployment infrastructure.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagrams](#architecture-diagrams)
- [Technology Stack](#technology-stack)
- [System Components](#system-components)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Payment Processing](#payment-processing)
- [Deployment Architecture](#deployment-architecture)
- [Security Architecture](#security-architecture)

## System Overview

LUD-SaaS is a modern, cloud-native SaaS platform that provides:
- User authentication and authorization
- Multi-tier subscription management
- Stripe-based payment processing
- AI-powered chatbot with file processing
- Email notification system
- API token management

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] --> B[React SPA]
        B --> C[Wouter Router]
        B --> D[React Query]
        B --> E[PocketBase SDK]
    end
    
    subgraph "API Layer"
        F[Express Server] --> G[API Routes]
        G --> H[Email Service]
        G --> I[Stripe Service]
        G --> J[Storage Service]
    end
    
    subgraph "Backend Services"
        K[PocketBase] --> L[(PocketBase DB)]
        M[n8n] --> N[AI/Chatbot]
        O[Stripe API]
    end
    
    subgraph "Monitoring"
        P[Sentry]
    end
    
    B --> F
    E --> K
    F --> K
    F --> O
    B --> M
    F --> P
    B --> P
    
    style A fill:#e1f5ff
    style B fill:#bbdefb
    style F fill:#c8e6c9
    style K fill:#fff9c4
    style M fill:#ffccbc
```

## Architecture Diagrams

### 1. Application Architecture

```mermaid
flowchart TB
    subgraph "Frontend - React SPA"
        A1[App.tsx<br/>Main Entry Point]
        A2[Navbar<br/>Navigation]
        A3[Router<br/>Page Routing]
        A4[Pages<br/>Home, Dashboard, etc]
        A5[Components<br/>UI Components]
        A6[Chatbot<br/>AI Assistant]
        
        A1 --> A2
        A1 --> A3
        A3 --> A4
        A4 --> A5
        A1 --> A6
    end
    
    subgraph "State Management"
        B1[React Query<br/>Server State]
        B2[Auth Context<br/>User State]
        B3[PocketBase Client<br/>Auth Store]
        
        B1 -.-> A4
        B2 -.-> A4
        B3 -.-> B2
    end
    
    subgraph "Backend - Express Server"
        C1[server/index.ts<br/>Entry Point]
        C2[routes.ts<br/>API Routes]
        C3[storage.ts<br/>DB Operations]
        C4[Email Service<br/>Nodemailer]
        
        C1 --> C2
        C2 --> C3
        C2 --> C4
    end
    
    subgraph "External Services"
        D1[(PocketBase<br/>Database)]
        D2[Stripe API<br/>Payments]
        D3[n8n Webhook<br/>Chatbot AI]
        D4[Sentry<br/>Monitoring]
    end
    
    A4 --> B1
    A6 --> D3
    B3 --> D1
    C2 --> D1
    C2 --> D2
    C1 --> D4
    A1 --> D4
    
    style A1 fill:#e3f2fd
    style C1 fill:#e8f5e9
    style D1 fill:#fff3e0
    style D2 fill:#fce4ec
```

### 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant PB as PocketBase
    participant S as Express Server
    
    U->>F: Open App
    F->>PB: Check Auth Status
    
    alt Not Authenticated
        U->>F: Click Login/Signup
        F->>F: Show Auth Modal
        U->>F: Enter Credentials
        F->>PB: POST /api/collections/users/auth-with-password
        PB->>PB: Validate Credentials
        PB-->>F: Return JWT Token + User Data
        F->>F: Store in AuthStore
        F-->>U: Redirect to Dashboard
    else Authenticated
        F-->>U: Show Protected Content
    end
    
    Note over F,PB: JWT Token stored in localStorage<br/>Auto-refreshed by PocketBase SDK
```

### 3. Subscription Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant PB as PocketBase
    participant S as Stripe
    participant W as Webhook
    
    U->>F: Select Subscription Plan
    F->>PB: GET /api/collections/products/records
    PB-->>F: Return Products/Plans
    F-->>U: Display Pricing
    
    U->>F: Click Subscribe
    F->>PB: POST /api/create-subscription
    PB->>S: Create Customer & Subscription
    S-->>PB: Return Client Secret
    PB-->>F: Return Subscription Details
    
    F->>S: Initialize Stripe.js
    U->>F: Enter Payment Details
    F->>S: Confirm Payment
    S-->>F: Payment Status
    
    S->>W: Webhook: payment_succeeded
    W->>PB: Update Subscription Status
    PB-->>W: Confirmation
    
    F->>PB: GET /api/collections/subscriptions/records
    PB-->>F: Updated Subscription
    F-->>U: Show Success + Dashboard
```

### 4. Chatbot Architecture

```mermaid
flowchart LR
    subgraph "Client"
        A[Chatbot Component]
        B[File Input]
        C[Text Input]
    end
    
    subgraph "Processing"
        D{Has File?}
        E[FormData<br/>with File]
        F[JSON<br/>Text Only]
    end
    
    subgraph "n8n Backend"
        G[Webhook Receiver]
        H[File Processor]
        I[AI Model]
        J[Response Generator]
    end
    
    A --> B
    A --> C
    B --> D
    C --> D
    
    D -->|Yes| E
    D -->|No| F
    
    E --> G
    F --> G
    
    G --> H
    H --> I
    I --> J
    J -->|Response| A
    
    Note1[Authentication Required<br/>for File Upload]
    B -.- Note1
    
    style A fill:#e1f5ff
    style G fill:#fff3e0
    style I fill:#f3e5f5
```

### 5. Deployment Architecture

```mermaid
graph TB
    subgraph "Client Device"
        A[Web Browser]
    end
    
    subgraph "CDN / Edge"
        B[Static Assets<br/>JS, CSS, Images]
    end
    
    subgraph "Google Cloud Run"
        C[Container Instance 1]
        D[Container Instance 2]
        E[Container Instance N]
        F[Load Balancer]
        
        F --> C
        F --> D
        F --> E
    end
    
    subgraph "External Services"
        G[(PocketBase Cloud<br/>pb.levelingupdata.com)]
        H[Stripe API]
        I[n8n Workflow<br/>n8n.levelingupdata.com]
        J[Sentry Monitoring]
        K[Gmail SMTP]
    end
    
    A --> B
    A --> F
    C --> G
    C --> H
    C --> I
    C --> J
    C --> K
    D --> G
    D --> H
    
    style A fill:#e3f2fd
    style F fill:#c8e6c9
    style C fill:#a5d6a7
    style D fill:#a5d6a7
    style E fill:#a5d6a7
    style G fill:#fff9c4
```

### 6. Database Schema (PocketBase)

```mermaid
erDiagram
    USERS ||--o{ SUBSCRIPTIONS : has
    USERS ||--o{ INVITATIONS : sends
    PRODUCTS ||--o{ SUBSCRIPTIONS : subscribes_to
    
    USERS {
        string id PK
        string username UK
        string email UK
        string password
        string name
        string stripeCustomerId
        string stripeSubscriptionId
        timestamp created
        timestamp updated
    }
    
    SUBSCRIPTIONS {
        string id PK
        string userId FK
        string plan
        string stripeSubscriptionId UK
        string status
        timestamp currentPeriodEnd
        int amount
        timestamp trialEnd
        timestamp created
        timestamp updated
    }
    
    PRODUCTS {
        string id PK
        string name
        int price
        string stripePriceId UK
        json features
        int maxUsers
        string storage
        int priority
    }
    
    INVITATIONS {
        string id PK
        string email UK
        string inviterId FK
        string status
        string token UK
        timestamp expiresAt
        timestamp acceptedAt
        timestamp created
    }
```

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.3.1 |
| TypeScript | Type Safety | 5.6.3 |
| Vite | Build Tool | 5.4.21 |
| Wouter | Routing | 3.3.5 |
| Tailwind CSS | Styling | 3.4.17 |
| shadcn/ui | Component Library | Latest |
| React Query | State Management | 5.60.5 |
| PocketBase SDK | Backend Client | 0.26.2 |
| Stripe.js | Payment UI | 8.0.0 |
| Framer Motion | Animations | 11.13.1 |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18+ |
| Express | Web Framework | 4.21.2 |
| TypeScript | Type Safety | 5.6.3 |
| Drizzle ORM | Database ORM | 0.39.1 |
| Stripe API | Payments | 19.0.0 |
| Nodemailer | Email | 7.0.9 |
| Zod | Schema Validation | 3.24.2 |
| WebSocket | Real-time | 8.18.0 |

### Infrastructure

| Service | Purpose |
|---------|---------|
| PocketBase | Backend as a Service |
| Google Cloud Run | Container Hosting |
| Docker | Containerization |
| Stripe | Payment Processing |
| n8n | Workflow Automation |
| Sentry | Error Monitoring |
| Gmail SMTP | Email Delivery |

## System Components

### Frontend Components

#### 1. Core Components

- **App.tsx** - Root component with providers and error boundary
- **Navbar** - Global navigation with auth state
- **Chatbot** - AI assistant with file upload
- **AuthModal** - Login/registration dialog
- **Footer** - Site footer with links

#### 2. Page Components

- **Home** - Landing page with features
- **Pricing** - Subscription plans
- **Dashboard** - User dashboard with analytics
- **Settings** - User settings and profile
- **Checkout** - Stripe checkout integration
- **Docs** - Documentation viewer

#### 3. UI Components (shadcn/ui)

Complete set of accessible, customizable components:
- Forms: Input, Textarea, Select, Checkbox, Radio
- Dialogs: Dialog, AlertDialog, Sheet, Drawer
- Navigation: Tabs, Accordion, Dropdown Menu
- Feedback: Toast, Alert, Progress, Skeleton
- Data Display: Table, Card, Avatar, Badge

### Backend Components

#### 1. Server Layer

- **server/index.ts** - Main entry point with Sentry integration
- **server/routes.ts** - API route handlers
- **server/storage.ts** - Database operations (Drizzle)
- **server/vite.ts** - Vite dev server integration

#### 2. API Endpoints

- `/api/health` - Health check
- `/api/products` - Product listing
- `/api/send-contact-email` - Contact form
- `/api/send-invite-email` - User invitations
- `/api/webhook` - Stripe webhooks

#### 3. PocketBase Hooks

- **create-subscription.js** - Subscription creation
- **stripe-webhook.js** - Webhook processing
- **users-tokens-generate.js** - API token generation

## Data Flow

### 1. Page Load Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant CDN as Static Assets
    participant API as Express API
    participant PB as PocketBase
    
    B->>CDN: GET /
    CDN-->>B: HTML, JS, CSS
    B->>B: Initialize React
    B->>PB: Check Auth Token
    
    alt Token Valid
        PB-->>B: User Data
        B->>API: GET /api/products
        API->>PB: Query Products
        PB-->>API: Products Data
        API-->>B: Products JSON
        B->>B: Render Dashboard
    else Token Invalid
        PB-->>B: 401 Unauthorized
        B->>B: Show Login Modal
    end
```

### 2. Real-time Updates

PocketBase provides real-time subscriptions:
- Subscribe to collection changes
- Receive instant updates via WebSocket
- Auto-sync UI with server state

## Database Schema

### Tables/Collections

#### Users (Auth Collection)
- Authentication and profile data
- Stripe customer linking
- Created by PocketBase auth system

#### Subscriptions
- User subscription status
- Stripe subscription linking
- Payment period tracking

#### Products
- Available subscription tiers
- Stripe price linking
- Feature lists and limits

#### Invitations
- User invitation system
- Token-based invites
- Expiration tracking

### Indexes

PocketBase automatically creates indexes on:
- Primary keys (id)
- Unique fields (email, username, stripeSubscriptionId)
- Foreign keys (userId)

## Authentication Flow

### JWT-based Authentication

1. **Login/Registration** - User submits credentials to PocketBase
2. **Token Generation** - PocketBase generates JWT token
3. **Client Storage** - Token stored in localStorage via SDK
4. **Auto-refresh** - SDK automatically refreshes token before expiry
5. **Request Authentication** - Token sent in Authorization header
6. **Server Validation** - PocketBase validates token on each request

### Authorization Rules

PocketBase collection rules:
```javascript
// Example: Subscriptions collection
// List Rule
userId = @request.auth.id

// View Rule
userId = @request.auth.id

// Create Rule
userId = @request.auth.id

// Update Rule
userId = @request.auth.id
```

## Payment Processing

### Stripe Integration

#### Setup
1. Customer created in Stripe
2. Subscription created with price ID
3. Payment intent generated
4. Client confirms payment
5. Webhook updates subscription status

#### Webhook Events
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

#### Security
- Webhook signature verification
- Idempotent webhook handling
- Secure key management

## Deployment Architecture

### Google Cloud Run

#### Container Configuration
```yaml
CPU: 1 vCPU
Memory: 1GB
Port: 8080
Min Instances: 0 (scale to zero)
Max Instances: 10
Concurrency: 80 requests/instance
Timeout: 300 seconds
```

#### Build Process
1. **Build Client** - Vite builds React app to `dist/`
2. **Build Server** - TypeScript compiled
3. **Docker Image** - Multi-stage build
4. **Push to GCR** - Google Container Registry
5. **Deploy** - Cloud Run pulls and deploys

#### Environment Variables
- Set via Cloud Run console or CLI
- Encrypted at rest
- Available to container at runtime

### CI/CD Pipeline

Using Cloud Build:
1. Push to GitHub triggers build
2. Cloud Build executes `cloudbuild.yaml`
3. Runs tests and builds
4. Creates Docker image
5. Deploys to Cloud Run
6. Health check verification

## Security Architecture

### Application Security

#### Frontend
- XSS Prevention - React's built-in escaping
- CSRF Protection - JWT in Authorization header
- Secure Storage - httpOnly cookies or localStorage
- Input Validation - Zod schemas

#### Backend
- Input Validation - Zod schemas on all inputs
- SQL Injection Prevention - Parameterized queries (Drizzle)
- Rate Limiting - Cloud Run built-in
- Error Handling - Sentry monitoring
- Secrets Management - Environment variables

#### Data Protection
- HTTPS Enforced - Cloud Run automatic
- Data Encryption - At rest (PocketBase/Cloud)
- Password Hashing - bcrypt (PocketBase)
- Token Expiration - JWT with expiry

### Network Security

```mermaid
flowchart TB
    A[Internet] -->|HTTPS| B[Cloud Run LB]
    B -->|HTTPS| C[Container]
    C -->|HTTPS| D[PocketBase]
    C -->|HTTPS| E[Stripe API]
    C -->|HTTPS| F[n8n]
    
    G[Firewall Rules]
    H[IAM Policies]
    
    G -.-> B
    H -.-> C
    
    style A fill:#ffebee
    style B fill:#e8f5e9
    style C fill:#e3f2fd
```

### Monitoring and Observability

#### Sentry Integration
- Error tracking and reporting
- Performance monitoring
- User session replay
- Custom breadcrumbs

#### Logging
- Structured JSON logs
- Request/response logging
- Error stack traces
- Performance metrics

#### Metrics
- Response times
- Error rates
- Subscription conversions
- User activity

## Scalability Considerations

### Horizontal Scaling
- Cloud Run auto-scales based on load
- Stateless design for easy scaling
- PocketBase handles high concurrency

### Performance Optimization
- React code splitting
- Lazy loading routes
- Image optimization
- CDN for static assets
- React Query caching

### Database Optimization
- PocketBase indexes
- Efficient queries
- Connection pooling
- Real-time subscriptions

## Future Enhancements

### Planned Features
- [ ] Multi-tenancy support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] API rate limiting per user
- [ ] Team collaboration features
- [ ] Webhook management UI
- [ ] Advanced reporting
- [ ] Integration marketplace

### Technical Improvements
- [ ] Redis caching layer
- [ ] GraphQL API option
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] A/B testing framework
- [ ] Advanced monitoring (Datadog/New Relic)

---

**Last Updated:** October 2024  
**Architecture Version:** 1.0  
**Maintained by:** Leveling Up Data Team

