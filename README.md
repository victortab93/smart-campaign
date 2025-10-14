# SmartCampaign - Email Marketing Platform

A comprehensive email marketing platform built with Next.js 14, featuring separate user and admin portals with advanced campaign management, contact segmentation, and subscription billing.

## Features

### User Portal
- **Dashboard**: Overview of campaigns, contacts, and performance metrics
- **Contact Management**: Create, edit, import/export contacts with tagging and segmentation
- **Campaign Creation**: Drag & drop email editor with templates and scheduling
- **Analytics**: Detailed campaign performance tracking
- **Subscription Management**: Plan selection, billing, and feature access control
- **Profile Management**: User settings and preferences

### Admin Portal
- **User Management**: Create, edit, suspend users with role-based access control
- **Subscription Oversight**: Monitor user subscriptions and billing
- **System Configuration**: SMTP settings, domain configuration, system limits
- **Analytics Dashboard**: Global metrics and system health monitoring
- **Audit Logs**: Track system changes and user actions
- **Security Management**: Access control and system security settings

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth and credentials
- **Payments**: Stripe integration
- **Email**: Nodemailer for SMTP
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics
- **Icons**: Lucide React

## Database Schema

The system includes comprehensive database tables for:

- **Users & Organizations**: Multi-tenant user management
- **Roles & Permissions**: Granular access control system
- **Plans & Features**: Subscription management with feature flags
- **Campaigns & Contacts**: Email campaign and contact management
- **Billing & Payments**: Stripe integration with webhook handling
- **Audit & Logging**: System activity tracking

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- Google OAuth credentials (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-campaign
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smartcampaign"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

5. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
smart-campaign/
├── app/                    # Next.js 14 app directory
│   ├── admin/             # Admin portal pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User portal pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── dashboard/        # User portal components
│   ├── contacts/         # Contact management components
│   ├── campaigns/        # Campaign components
│   └── subscription/     # Subscription components
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── prisma/              # Database schema and migrations
└── types/               # TypeScript type definitions
```

## Key Features

### Authentication System
- NextAuth.js with multiple providers
- Google OAuth integration
- JWT-based sessions
- Role-based access control

### Subscription Management
- Multiple pricing tiers (Starter, Growth, Automate)
- Feature-based access control
- Stripe payment integration
- Automated billing and renewals

### Campaign Management
- Drag & drop email editor
- Template system
- Scheduling and automation
- Performance tracking
- A/B testing capabilities

### Contact Management
- CSV/Excel import/export
- Tagging and segmentation
- Contact history tracking
- GDPR compliance features

### Admin Features
- User management and role assignment
- System configuration
- Analytics and reporting
- Audit logging
- Security monitoring

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get current session

### User Management
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `PUT /api/users/[id]` - Update user (admin)
- `DELETE /api/users/[id]` - Delete user (admin)

### Campaigns
- `GET /api/campaigns` - List user campaigns
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `POST /api/campaigns/[id]/send` - Send campaign

### Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact
- `POST /api/contacts/import` - Import contacts

### Subscriptions
- `GET /api/subscriptions` - List subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/[id]` - Update subscription
- `POST /api/subscriptions/[id]/cancel` - Cancel subscription

## Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Set up Stripe webhooks
5. Configure SMTP settings

### Production Considerations
- Enable database connection pooling
- Set up Redis for session storage
- Configure CDN for static assets
- Set up monitoring and logging
- Implement rate limiting
- Configure backup strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

