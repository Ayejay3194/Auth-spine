# 🚀 Getting Started with SaaS Builder Kit

Welcome to SaaS Builder Kit! This guide will help you get your SaaS application up and running in minutes.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database (or use a cloud service like Supabase/Railway)
- **Git** for version control

## ⚡ Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/saas-builder.git
cd saas-builder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Setup Script

```bash
npm run setup
```

This interactive script will:
- ✅ Install all required dependencies
- ✅ Create your `.env` file with secure defaults
- ✅ Set up your database schema
- ✅ Generate Prisma client
- ✅ Create necessary directories

### 4. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** to see your SaaS application!

## 🔧 Manual Setup (Optional)

If you prefer to set up everything manually:

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/saas_builder"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Stripe (Optional)
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Email (Optional)
RESEND_API_KEY="re_your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"
```

### Database Setup

1. **Create Database:**
   ```sql
   CREATE DATABASE saas_builder;
   ```

2. **Run Prisma Migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed Database (Optional):**
   ```bash
   npx prisma db seed
   ```

## 🎯 Next Steps

### 1. Choose a Template

1. Go to **http://localhost:3000/templates**
2. Browse 20+ available templates
3. Select one that fits your needs
4. Click "Use Template" to customize

### 2. Configure Authentication

Set up OAuth providers:

**Google OAuth:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

**GitHub OAuth:**
1. Visit [GitHub Settings > Developer settings](https://github.com/settings/applications/new)
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

### 3. Set Up Payments (Optional)

**Stripe Integration:**
1. Create a [Stripe account](https://dashboard.stripe.com/)
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhooks for production
4. Update `.env` with your keys

### 4. Configure Email (Optional)

**Resend Integration:**
1. Create a [Resend account](https://resend.com/)
2. Get your API key
3. Verify your domain
4. Update `.env` with your API key

## 🏗️ Project Structure

```
saas-builder/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── templates/         # Template selection
│   └── settings/          # User settings
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── templates/        # Template components
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma database client
│   ├── email.ts         # Email functions (Resend)
│   ├── stripe.ts        # Stripe integration
│   └── utils.ts         # Utility functions
├── prisma/               # Database schema & migrations
├── public/              # Static assets
├── scripts/             # Setup & deployment scripts
└── types/               # TypeScript type definitions
```

## 🎨 Customization

### Changing Colors & Theme

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#your-color",
        // ... other shades
      }
    }
  }
}
```

### Adding New Templates

1. Create template in `templates/` directory
2. Add template metadata to `app/templates/page.tsx`
3. Create template-specific components
4. Update database schema if needed

### Custom Database Models

1. Edit `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev`
3. Update TypeScript types

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run deploy:vercel
```

### Netlify

```bash
npm run build
# Deploy the .next folder to Netlify
```

### Docker

```bash
docker build -t saas-builder .
docker run -p 3000:3000 saas-builder
```

## 📚 Common Tasks

### Adding New API Endpoints

Create files in `app/api/`:

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}
```

### Creating New Pages

Add files to `app/` directory:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>
}
```

### Adding Authentication Middleware

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"]
}
```

## 🔍 Debugging

### Common Issues

**Database Connection:**
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

**Authentication Issues:**
- Check `NEXTAUTH_SECRET` is set
- Verify OAuth provider credentials
- Check redirect URLs in OAuth settings

**Build Errors:**
- Run `npm install` to update dependencies
- Check TypeScript configuration
- Verify import paths

### Environment Variables Debug

Create a debug endpoint to check env vars:

```typescript
// app/api/debug/route.ts
export async function GET() {
  return Response.json({
    database: !!process.env.DATABASE_URL,
    nextauth: !!process.env.NEXTAUTH_SECRET,
    stripe: !!process.env.STRIPE_SECRET_KEY,
  })
}
```

## 🆘 Getting Help

- **Documentation:** [docs.saasbuilder.com](https://docs.saasbuilder.com)
- **Discord Community:** [discord.gg/saasbuilder](https://discord.gg/saasbuilder)
- **GitHub Issues:** [github.com/your-org/saas-builder/issues](https://github.com/your-org/saas-builder/issues)
- **Email Support:** support@saasbuilder.com

## 🎉 You're Ready!

Congratulations! Your SaaS Builder Kit is now set up and ready to use. Here's what you can do next:

1. 🎨 **Browse Templates** - Visit `/templates` to explore available templates
2. 🔐 **Set Up Auth** - Configure OAuth providers for user authentication
3. 💳 **Add Payments** - Integrate Stripe for subscription management
4. 📊 **Build Dashboard** - Customize your user dashboard
5. 🚀 **Deploy** - Launch your SaaS to production

Happy building! 🚀

---

**Need help?** Join our [Discord community](https://discord.gg/saasbuilder) or check our [documentation](https://docs.saasbuilder.com).
