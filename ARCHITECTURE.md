# SmartCampaign Architecture

## Overview

SmartCampaign uses a **3-tier architecture** with proper separation of concerns and security best practices:

```
Frontend (Next.js) <-> BFF (Express) <-> API (Express) <-> Database (PostgreSQL)
```

## Architecture Flow

### 1. Frontend Layer (Port 3000)
- **Technology**: Next.js 14, React 18, TypeScript
- **Authentication**: Session-based via HTTP-only cookies (managed by BFF)
- **Communication**: Communicates ONLY with BFF server
- **Security**: No tokens stored in browser, no direct API access

### 2. BFF (Backend For Frontend) Layer (Port 3001)
- **Technology**: Express.js with express-session
- **Purpose**:
  - Manages user sessions with HTTP-only cookies
  - Handles authentication (login/register/logout)
  - Stores API tokens securely in server-side sessions
  - Proxies requests to API with secure tokens
  - Authorization and role-based access control
- **Session Storage**: PostgreSQL (via connect-pg-simple)
- **Security**:
  - Session cookies are HTTP-only, secure, and SameSite
  - API tokens never exposed to frontend
  - CORS restricted to frontend origin only

### 3. API Layer (Port 3002)
- **Technology**: Express.js with JWT authentication
- **Purpose**:
  - Business logic execution via UserBFF class
  - Data access through repositories
  - Database operations
  - Token-based authentication from BFF
- **Security**:
  - Requires valid JWT token in Authorization header
  - CORS restricted to BFF origin only
  - Validates token on every request

### 4. Data Layer
- **Database**: PostgreSQL
- **ORM**: Raw SQL with pg driver
- **Patterns**: Repository pattern, Service pattern

## Authentication Flow

### Login
```
1. User submits credentials to Frontend
2. Frontend sends POST to BFF: /api/auth/login
3. BFF validates credentials using AuthService
4. BFF creates session and stores API token in session
5. BFF returns session cookie to Frontend
6. Frontend stores session cookie (HTTP-only, automatic)
```

### Making Authenticated Requests
```
1. Frontend sends request to BFF with session cookie
2. BFF validates session
3. BFF extracts API token from session
4. BFF makes request to API with token in Authorization header
5. API validates token and processes request
6. API returns data to BFF
7. BFF returns data to Frontend
```

### Logout
```
1. Frontend sends POST to BFF: /api/auth/logout
2. BFF destroys session
3. BFF clears session cookie
4. Frontend redirected to login
```

## Directory Structure

```
project/
├── app/                    # Next.js frontend
│   ├── auth/              # Auth pages
│   ├── dashboard/         # User dashboard pages
│   └── admin/             # Admin pages
├── bff/                   # BFF server
│   ├── server.ts          # Express server setup
│   ├── middleware/        # Auth middleware
│   ├── routes/            # Route handlers
│   ├── services/          # API client
│   └── types/             # TypeScript types
├── api/                   # API server
│   ├── server.ts          # Express server setup
│   ├── middleware/        # Token validation
│   └── routes/            # API endpoints
├── lib/                   # Shared business logic
│   ├── bff/              # BFF business logic
│   ├── services/         # Domain services
│   ├── repositories/     # Data access layer
│   └── database.ts       # Database connection
├── components/            # React components
├── types/                # TypeScript type definitions
└── database/             # Database schema and migrations
```

## Starting the Application

### Development Mode
```bash
npm run dev
```
This starts all three servers concurrently:
- Frontend: http://localhost:3000
- BFF: http://localhost:3001
- API: http://localhost:3002

Individual servers:
```bash
npm run dev:frontend  # Start only frontend
npm run dev:bff       # Start only BFF
npm run dev:api       # Start only API
```

### Production Mode
```bash
npm run build         # Build all components
npm run start         # Start all servers
```

Individual production servers:
```bash
npm run start:frontend
npm run start:bff
npm run start:api
```

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartcampaign
DB_USER=postgres
DB_PASSWORD=password

# Secrets
JWT_SECRET=your-jwt-secret        # For API token signing
SESSION_SECRET=your-session-secret # For session encryption

# Ports
BFF_PORT=3001
API_PORT=3002

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BFF_URL=http://localhost:3001
BFF_URL=http://localhost:3001
API_BASE_URL=http://localhost:3002
```

## Security Benefits

### Frontend Security
- ✅ No tokens stored in localStorage or sessionStorage
- ✅ No tokens in JavaScript accessible memory
- ✅ HTTP-only cookies prevent XSS attacks
- ✅ No direct API access

### BFF Security
- ✅ Session-based authentication
- ✅ API tokens stored server-side only
- ✅ CORS restricted to frontend origin
- ✅ Session storage in PostgreSQL
- ✅ Secure cookie settings (httpOnly, secure, sameSite)

### API Security
- ✅ Token-based authentication
- ✅ CORS restricted to BFF origin
- ✅ Token validation on every request
- ✅ User context validation
- ✅ No direct frontend access

## API Endpoints

### BFF Endpoints (Frontend → BFF)
```
POST   /api/auth/login       # Login
POST   /api/auth/register    # Register
POST   /api/auth/logout      # Logout
GET    /api/auth/me          # Get current user

GET    /api/contacts         # List contacts
POST   /api/contacts         # Create contact
GET    /api/contacts/:id     # Get contact
PUT    /api/contacts/:id     # Update contact
DELETE /api/contacts/:id     # Delete contact

GET    /api/campaigns        # List campaigns
POST   /api/campaigns        # Create campaign
GET    /api/campaigns/:id    # Get campaign
PUT    /api/campaigns/:id    # Update campaign
DELETE /api/campaigns/:id    # Delete campaign

GET    /api/dashboard/stats  # Get dashboard stats
GET    /api/subscriptions    # Get subscription
GET    /api/subscriptions/plans # Get available plans
```

### API Endpoints (BFF → API)
```
All require: Authorization: Bearer <token>

GET    /contacts
POST   /contacts
GET    /contacts/:id
PUT    /contacts/:id
DELETE /contacts/:id

GET    /campaigns
POST   /campaigns
GET    /campaigns/:id
PUT    /campaigns/:id
DELETE /campaigns/:id

GET    /dashboard/stats
GET    /subscriptions
GET    /subscriptions/plans
```

## Migration from Old Architecture

### Before (Insecure)
```
Frontend → Next.js API Routes → Database
- Tokens in cookies accessible to API routes
- Frontend could access tokens
- Single server handling everything
```

### After (Secure)
```
Frontend → BFF (Session) → API (Token) → Database
- Tokens never exposed to frontend
- Sessions managed securely server-side
- Clear separation of concerns
- API protected by token authentication
```

## Testing

### Health Checks
```bash
# BFF health check
curl http://localhost:3001/health

# API health check
curl http://localhost:3002/health
```

### Authentication Test
```bash
# Login via BFF
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Get user data (with session)
curl http://localhost:3001/api/auth/me \
  -b cookies.txt
```

## Deployment Considerations

### Production Checklist
- [ ] Set strong JWT_SECRET and SESSION_SECRET
- [ ] Enable HTTPS (set secure: true in cookies)
- [ ] Configure proper CORS origins
- [ ] Set up PostgreSQL connection pooling
- [ ] Enable database SSL
- [ ] Set up load balancing for BFF and API
- [ ] Configure session store cleanup
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Configure firewall rules (API should not be publicly accessible)

### Network Architecture
```
Internet → Load Balancer
           ↓
           Frontend Server (Port 3000)
           ↓
           BFF Server (Port 3001) ← Session Store (PostgreSQL)
           ↓
           API Server (Port 3002) ← Database (PostgreSQL)
```

Note: API server should NOT be directly accessible from the internet.
