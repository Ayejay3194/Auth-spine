# 🔧 Complete Setup Guide for SaaS Builder Kit

This guide will walk you through setting up the SaaS Builder Kit from scratch, addressing all potential issues and ensuring a smooth development experience.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm 9+** or **yarn** - Comes with Node.js
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/) or use a cloud service
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/saas-builder.git
cd saas-builder

# Install all dependencies (this fixes all lint errors)
npm install
```

### Step 2: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Run the interactive setup script
npm run setup
```

### Step 3: Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push
```

### Step 4: Start Development

```bash
npm run dev
```

Visit **http://localhost:3000** - Your SaaS is ready! 🎉

---

## 🔍 Troubleshooting Lint Errors

If you're seeing lint errors like "Cannot find module...", here's how to fix them:

### 1. Missing Dependencies

All the missing modules are listed in `package.json`. Install them:

```bash
npm install
```

This will install all required packages including:
- `next`, `react`, `react-dom` - Core React/Next.js
- `next-auth` - Authentication
- `@prisma/client`, `prisma` - Database
- `stripe` - Payments
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `@radix-ui/*` - UI components
- And many more...

### 2. TypeScript Errors

If you see TypeScript errors, ensure types are installed:

```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

### 3. Tailwind CSS Warnings

The `@tailwind` and `@apply` warnings are normal - they'll disappear once you run the development server:

```bash
npm run dev
```

---

## 📁 Project Structure Overview

```
saas-builder/
├── 📂 app/                    # Next.js 13+ App Router
│   ├── 📂 api/               # API routes & webhooks
│   │   ├── auth/            # NextAuth endpoints
│   │   └── stripe/          # Stripe webhooks
│   ├── 📂 auth/              # Authentication pages
│   │   ├── signin/          # Login page
│   │   └── signup/          # Registration page
│   ├── 📂 dashboard/         # User dashboard
│   ├── 📂 templates/         # Template library
│   └── 📂 settings/          # User settings
├── 📂 components/            # React components
│   ├── 📂 ui/               # Base UI components (shadcn/ui)
│   │   ├── button.tsx       # Button component
│   │   ├── card.tsx         # Card component
│   │   ├── input.tsx        # Input component
│   │   └── ...              # More UI components
│   ├── 📂 auth/             # Authentication components
│   ├── 📂 dashboard/        # Dashboard components
│   ├── 📂 landing/          # Landing page components
│   └── 📂 layout/           # Layout components
├── 📂 lib/                  # Utility libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma database client
│   ├── email.ts            # Email functions (Resend)
│   ├── stripe.ts           # Stripe integration
│   └── utils.ts            # Utility functions
├── 📂 prisma/               # Database schema & migrations
│   └── schema.prisma       # Database schema
├── 📂 public/              # Static assets
├── 📂 scripts/             # Setup & deployment scripts
│   └── setup.js            # Interactive setup script
├── 📂 types/               # TypeScript type definitions
│   └── next-auth.d.ts      # NextAuth types
└── 📄 Configuration files
    ├── package.json        # Dependencies & scripts
    ├── tailwind.config.js  # Tailwind configuration
    ├── tsconfig.json       # TypeScript configuration
    ├── next.config.js      # Next.js configuration
    └── .env.example        # Environment variables template
```

---

## 🔧 Environment Configuration

### Required Environment Variables

Edit your `.env` file with these settings:

```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/saas_builder"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-key-here"

# OAuth Providers (Optional - for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Stripe (Optional - for payments)
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Email (Optional - for transactional emails)
RESEND_API_KEY="re_your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# App Settings (Optional)
APP_NAME="My SaaS App"
APP_URL="http://localhost:3000"
SUPPORT_EMAIL="support@yourdomain.com"
```

### Generating Secure Secrets

For `NEXTAUTH_SECRET`, generate a secure random string:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -base64 32
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** from [postgresql.org](https://www.postgresql.org/download/)
2. **Create database:**
   ```sql
   CREATE DATABASE saas_builder;
   ```
3. **Update .env** with your connection string

### Option 2: Cloud Database (Recommended for beginners)

**Supabase (Free):**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get the connection string from Settings > Database
4. Update your `.env` file

**Railway (Free tier):**
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL service
3. Get the connection string
4. Update your `.env` file

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

---

## 🔐 Authentication Setup

### Email & Password (Built-in)

Already configured! Just make sure your database is connected.

### Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable APIs:**
   - Google+ API
   - People API
4. **Create OAuth 2.0 credentials:**
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. **Copy Client ID and Secret** to your `.env` file

### GitHub OAuth Setup

1. **Go to [GitHub Settings > Developer settings](https://github.com/settings/applications/new)**
2. **Create a new OAuth App:**
   - Application name: Your SaaS name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. **Copy Client ID and Secret** to your `.env` file

---

## 💳 Payment Setup (Stripe)

### 1. Create Stripe Account

1. **Sign up at [stripe.com](https://stripe.com)**
2. **Complete onboarding** (use test mode for development)

### 2. Get API Keys

1. **Go to Dashboard > Developers > API keys**
2. **Copy the test keys:**
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### 3. Set Up Webhooks

1. **Go to Developers > Webhooks**
2. **Add endpoint:** `http://localhost:3000/api/stripe/webhook`
3. **Select events:**
   - checkout.session.completed
   - invoice.payment_succeeded
   - invoice.payment_failed
   - customer.subscription.deleted
4. **Copy webhook signing secret** to `.env`

### 4. Update .env

```env
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 📧 Email Setup (Resend)

### 1. Create Resend Account

1. **Sign up at [resend.com](https://resend.com)**
2. **Get API key** from Dashboard > API Keys

### 2. Verify Domain

1. **Add your domain** in Dashboard > Domains
2. **Add DNS records** as instructed
3. **Wait for verification**

### 3. Update .env

```env
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"
```

---

## 🎨 Customization Guide

### Changing Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#3b82f6",  // Change this
        // ... other shades
      }
    }
  }
}
```

### Adding New Templates

1. **Create template directory:**
   ```bash
   mkdir templates/my-template
   ```

2. **Add template files:**
   ```
   templates/my-template/
   ├── components/
   ├── pages/
   ├── styles/
   └── config.json
   ```

3. **Update template list** in `app/templates/page.tsx`

### Custom Database Models

1. **Edit `prisma/schema.prisma`**
2. **Generate migration:**
   ```bash
   npx prisma migrate dev --name my-migration
   ```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Netlify

```bash
# Build the project
npm run build

# Deploy the .next folder
```

### Docker

```bash
# Build image
docker build -t saas-builder .

# Run container
docker run -p 3000:3000 saas-builder
```

---

## 🔍 Common Issues & Solutions

### Issue: "Cannot find module" errors

**Solution:** Install dependencies
```bash
npm install
```

### Issue: Database connection failed

**Solution:** Check DATABASE_URL in .env
```bash
# Test connection
npx prisma db pull
```

### Issue: NextAuth errors

**Solution:** Check NEXTAUTH_SECRET and NEXTAUTH_URL
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: Tailwind CSS not working

**Solution:** Restart development server
```bash
npm run dev
```

### Issue: TypeScript errors

**Solution:** Install missing types
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

---

## 📞 Getting Help

If you're still stuck:

1. **Check the logs:** Look at terminal output for specific errors
2. **Review .env:** Ensure all required variables are set
3. **Reinstall dependencies:** `rm -rf node_modules package-lock.json && npm install`
4. **Check documentation:** [docs.saasbuilder.com](https://docs.saasbuilder.com)
5. **Join community:** [discord.gg/saasbuilder](https://discord.gg/saasbuilder)
6. **Create an issue:** [GitHub Issues](https://github.com/your-org/saas-builder/issues)

---

## 🎉 You're Ready!

Once you've completed these steps:

1. ✅ Dependencies installed
2. ✅ Environment configured
3. ✅ Database connected
4. ✅ Development server running

Your SaaS Builder Kit is fully functional! 

**Next steps:**
- Browse templates at `/templates`
- Set up authentication at `/auth/signin`
- Configure dashboard at `/dashboard`
- Customize to your needs

Happy building! 🚀

---

**📝 Quick Checklist:**
- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Dependencies installed (`npm install`)
- [ ] .env file configured
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Development server running (`npm run dev`)
- [ ] Can access http://localhost:3000
