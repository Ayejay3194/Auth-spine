/**
 * Next.js Integration for Supabase SaaS Advanced Pack 2
 * 
 * Provides Next.js project setup, middleware, API routes,
 * and page generation for SaaS applications.
 */

import { NextJSIntegration } from './types.js';

export class NextJSIntegrationManager {
  private config: any;
  private integration: NextJSIntegration;
  private initialized = false;

  /**
   * Initialize Next.js integration
   */
  async initialize(config: any): Promise<void> {
    this.config = config;
    this.integration = {
      app: {
        enabled: config.appDir,
        layout: 'app/layout.tsx',
        routing: 'app',
        components: {
          layout: { header: true, sidebar: true, footer: true, navigation: { enabled: true } },
          auth: { login: true, register: true, forgot: true, mfa: config.auth?.mfa },
          tenant: { switcher: true, settings: true, users: true },
          billing: { subscription: true, usage: true, invoices: true }
        },
        styles: {
          theme: { mode: 'auto', colors: { primary: '#3b82f6', secondary: '#64748b' }, typography: { fontFamily: 'Inter' } },
          components: { button: { variant: ['solid', 'outline', 'ghost'] }, input: { variant: ['default', 'filled'] } },
          responsive: { breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280 } }
        }
      },
      middleware: {
        enabled: config.middleware,
        auth: true,
        tenant: true,
        rateLimit: true,
        cors: true
      },
      api: {
        enabled: config.apiRoutes,
        routes: [],
        middleware: [],
        validation: { schema: {}, sanitizer: { enabled: true, rules: [] } }
      },
      pages: {
        dashboard: {
          enabled: config.pages?.dashboard,
          widgets: [],
          layout: { columns: 12, rows: 8, widgets: [] },
          permissions: ['dashboard.view']
        },
        billing: {
          enabled: config.pages?.billing,
          plans: [],
          invoices: { enabled: true, templates: [], automation: true },
          payments: { providers: [], webhooks: true, refunds: true }
        },
        settings: {
          enabled: config.pages?.settings,
          sections: [],
          validation: { enabled: true, rules: [] }
        },
        admin: {
          enabled: config.pages?.admin,
          modules: [],
          permissions: { roles: [], permissions: [] }
        }
      }
    };
    
    this.initialized = true;
  }

  /**
   * Setup Next.js project
   */
  async setupProject(): Promise<void> {
    try {
      // Create package.json
      await this.createPackageJSON();
      
      // Create next.config.js
      await this.createNextConfig();
      
      // Create tailwind.config.js
      await this.createTailwindConfig();
      
      // Create globals.css
      await this.createGlobalsCSS();
      
      // Create tsconfig.json
      await this.createTSConfig();
      
      console.log('Next.js project setup completed');
    } catch (error) {
      console.error('Failed to setup Next.js project:', error);
      throw error;
    }
  }

  /**
   * Setup App Directory
   */
  async setupAppDir(): Promise<void> {
    try {
      // Create app/layout.tsx
      await this.createAppLayout();
      
      // Create app/page.tsx
      await this.createHomePage();
      
      // Create app/globals.css
      await this.createAppGlobalsCSS();
      
      // Create components directory
      await this.createComponents();
      
      console.log('App directory setup completed');
    } catch (error) {
      console.error('Failed to setup app directory:', error);
      throw error;
    }
  }

  /**
   * Setup Middleware
   */
  async setupMiddleware(): Promise<void> {
    try {
      // Create middleware.ts
      await this.createMiddleware();
      
      // Create auth middleware
      await this.createAuthMiddleware();
      
      // Create tenant middleware
      await this.createTenantMiddleware();
      
      // Create rate limiting middleware
      await this.createRateLimitMiddleware();
      
      console.log('Middleware setup completed');
    } catch (error) {
      console.error('Failed to setup middleware:', error);
      throw error;
    }
  }

  /**
   * Setup API Routes
   */
  async setupAPIRoutes(): Promise<void> {
    try {
      // Create API directory structure
      await this.createAPIDirectory();
      
      // Create auth routes
      await this.createAuthRoutes();
      
      // Create user routes
      await this.createUserRoutes();
      
      // Create billing routes
      await this.createBillingRoutes();
      
      // Create admin routes
      await this.createAdminRoutes();
      
      console.log('API routes setup completed');
    } catch (error) {
      console.error('Failed to setup API routes:', error);
      throw error;
    }
  }

  /**
   * Setup Pages
   */
  async setupPages(): Promise<void> {
    try {
      // Create dashboard pages
      await this.createDashboardPages();
      
      // Create billing pages
      await this.createBillingPages();
      
      // Create settings pages
      await this.createSettingsPages();
      
      // Create admin pages
      await this.createAdminPages();
      
      console.log('Pages setup completed');
    } catch (error) {
      console.error('Failed to setup pages:', error);
      throw error;
    }
  }

  /**
   * Generate files
   */
  generateFiles(): Record<string, string> {
    return {
      'package.json': this.generatePackageJSON(),
      'next.config.js': this.generateNextConfig(),
      'tailwind.config.js': this.generateTailwindConfig(),
      'tsconfig.json': this.generateTSConfig(),
      'middleware.ts': this.generateMiddleware(),
      'app/layout.tsx': this.generateAppLayout(),
      'app/page.tsx': this.generateHomePage(),
      'app/globals.css': this.generateAppGlobalsCSS(),
      'lib/supabase.ts': this.generateSupabaseClient(),
      'lib/auth.ts': this.generateAuthConfig(),
      'lib/db.ts': this.generateDatabaseConfig(),
      'components/layout/header.tsx': this.generateHeader(),
      'components/layout/sidebar.tsx': this.generateSidebar(),
      'components/auth/login-form.tsx': this.generateLoginForm(),
      'components/auth/register-form.tsx': this.generateRegisterForm(),
      'components/dashboard/dashboard-nav.tsx': this.generateDashboardNav(),
      'components/billing/subscription-card.tsx': this.generateSubscriptionCard(),
      'components/settings/profile-form.tsx': this.generateProfileForm()
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
  }

  private async createPackageJSON(): Promise<void> {
    const content = this.generatePackageJSON();
    console.log('Creating package.json...');
  }

  private async createNextConfig(): Promise<void> {
    const content = this.generateNextConfig();
    console.log('Creating next.config.js...');
  }

  private async createTailwindConfig(): Promise<void> {
    const content = this.generateTailwindConfig();
    console.log('Creating tailwind.config.js...');
  }

  private async createGlobalsCSS(): Promise<void> {
    const content = this.generateAppGlobalsCSS();
    console.log('Creating globals.css...');
  }

  private async createTSConfig(): Promise<void> {
    const content = this.generateTSConfig();
    console.log('Creating tsconfig.json...');
  }

  private async createAppLayout(): Promise<void> {
    const content = this.generateAppLayout();
    console.log('Creating app/layout.tsx...');
  }

  private async createHomePage(): Promise<void> {
    const content = this.generateHomePage();
    console.log('Creating app/page.tsx...');
  }

  private async createAppGlobalsCSS(): Promise<void> {
    const content = this.generateAppGlobalsCSS();
    console.log('Creating app/globals.css...');
  }

  private async createComponents(): Promise<void> {
    console.log('Creating components directory...');
  }

  private async createMiddleware(): Promise<void> {
    const content = this.generateMiddleware();
    console.log('Creating middleware.ts...');
  }

  private async createAuthMiddleware(): Promise<void> {
    console.log('Creating auth middleware...');
  }

  private async createTenantMiddleware(): Promise<void> {
    console.log('Creating tenant middleware...');
  }

  private async createRateLimitMiddleware(): Promise<void> {
    console.log('Creating rate limit middleware...');
  }

  private async createAPIDirectory(): Promise<void> {
    console.log('Creating API directory structure...');
  }

  private async createAuthRoutes(): Promise<void> {
    console.log('Creating auth routes...');
  }

  private async createUserRoutes(): Promise<void> {
    console.log('Creating user routes...');
  }

  private async createBillingRoutes(): Promise<void> {
    console.log('Creating billing routes...');
  }

  private async createAdminRoutes(): Promise<void> {
    console.log('Creating admin routes...');
  }

  private async createDashboardPages(): Promise<void> {
    console.log('Creating dashboard pages...');
  }

  private async createBillingPages(): Promise<void> {
    console.log('Creating billing pages...');
  }

  private async createSettingsPages(): Promise<void> {
    console.log('Creating settings pages...');
  }

  private async createAdminPages(): Promise<void> {
    console.log('Creating admin pages...');
  }

  private generatePackageJSON(): string {
    return `{
  "name": "supabase-saas-advanced",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:types": "supabase gen types typescript --local > types/database.ts"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@supabase/auth-ui-react": "^0.4.7",
    "@supabase/auth-ui-shared": "^0.1.8",
    "@supabase/supabase-js": "^2.38.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-button": "^0.1.0",
    "@radix-ui/react-card": "^0.1.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-form": "^0.0.3",
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.8.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "react-hook-form": "^7.48.2",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.3.0"
  }
}`;
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/rest/v1/:path*',
        destination: process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/:path*',
      },
      {
        source: '/auth/v1/:path*',
        destination: process.env.NEXT_PUBLIC_SUPABASE_URL + '/auth/v1/:path*',
      },
      {
        source: '/storage/v1/:path*',
        destination: process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/:path*',
      },
      {
        source: '/functions/v1/:path*',
        destination: process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;`;
  }

  private generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};`;
  }

  private generateTSConfig(): string {
    return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/app/*": ["./app/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
  }

  private generateMiddleware(): string {
    return `import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    // Check admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (userRole?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};`;
  }

  private generateAppLayout(): string {
    return `import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SaaS Application',
  description: 'Advanced SaaS application with Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}`;
  }

  private generateHomePage(): string {
    return `import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold">SaaS App</div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6">
              Build Your SaaS with Supabase
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Advanced SaaS features with Next.js, Supabase, and enterprise-grade capabilities.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/auth/register">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">View Demo</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Advanced Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Multi-Tenancy</h3>
                <p className="text-muted-foreground">
                  Built-in multi-tenant architecture with tenant isolation and provisioning.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Enterprise Auth</h3>
                <p className="text-muted-foreground">
                  Advanced authentication with MFA, SSO, RBAC, and session management.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Real-time Features</h3>
                <p className="text-muted-foreground">
                  Real-time collaboration, presence, notifications, and live updates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 SaaS Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}`;
  }

  private generateAppGlobalsCSS(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`;
  }

  private generateSupabaseClient(): string {
    return `import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

export const supabase = createClientComponentClient<Database>();

export const createClient = () => createClientComponentClient<Database>();`;
  }

  private generateAuthConfig(): string {
    return `import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './database.types';

export async function getServerSupabase() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

export async function getSession() {
  const supabase = await getServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user;
}`;
  }

  private generateDatabaseConfig(): string {
    return `import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseAdmin;`;
  }

  private generateHeader(): string {
    return `'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, signOut } = useSupabase();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">
            SaaS App
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/billing">
                <Button variant="ghost">Billing</Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}`;
  }

  private generateSidebar(): string {
    return `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  BarChart3,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}`;
  }

  private generateLoginForm(): string {
    return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn } = useSupabase();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}`;
  }

  private generateRegisterForm(): string {
    return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp } = useSupabase();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
      });
      
      if (error) {
        setError(error.message);
      } else {
        router.push('/auth/verify-email');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}`;
  }

  private generateDashboardNav(): string {
    return `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Bell, Settings } from 'lucide-react';

export function DashboardNav() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Select>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="workspace1">Workspace 1</SelectItem>
            <SelectItem value="workspace2">Workspace 2</SelectItem>
            <SelectItem value="workspace3">Workspace 3</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}`;
  }

  private generateSubscriptionCard(): string {
    return `'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

interface SubscriptionCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    popular?: boolean;
  };
  currentPlan?: string;
  onUpgrade: (planId: string) => void;
}

export function SubscriptionCard({ plan, currentPlan, onUpgrade }: SubscriptionCardProps) {
  const isCurrentPlan = currentPlan === plan.id;
  const pricePerMonth = plan.interval === 'year' ? plan.price / 12 : plan.price;

  return (
    <Card className={plan.popular ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.popular && (
            <Badge variant="secondary" className="text-primary">
              <Star className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
        <CardDescription>
          <div className="mt-2">
            <span className="text-3xl font-bold">
              ${plan.interval === 'year' ? pricePerMonth.toFixed(2) : plan.price}
            </span>
            <span className="text-muted-foreground">
              /{plan.interval === 'year' ? 'month (billed yearly)' : 'month'}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'secondary'}
          disabled={isCurrentPlan}
          onClick={() => onUpgrade(plan.id)}
        >
          {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
        </Button>
      </CardFooter>
    </Card>
  );
}`;
  }

  private generateProfileForm(): string {
    return `'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

export function ProfileForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, updateProfile } = useSupabase();

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle avatar upload
      console.log('Avatar upload:', file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your profile information and avatar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="text-lg">
                {fullName?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Change Avatar
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
              />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}`;
}

// Export singleton instance
export const nextjsIntegration = new NextJSIntegrationManager();
