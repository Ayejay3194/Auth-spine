import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, JwtPayload } from "../../packages/auth/src/index";

// Route protection configuration
const PROTECTED_ROUTES = {
  // Admin only routes
  admin: ['/admin', '/admin/users', '/admin/settings', '/admin/audit', '/admin/payroll'],
  // Manager+ routes  
  manager: ['/manager', '/manager/team', '/manager/reports', '/manager/schedule'],
  // Staff+ routes
  staff: ['/staff', '/staff/dashboard', '/staff/bookings', '/staff/profile'],
  // Authenticated users only
  authenticated: ['/dashboard', '/profile', '/settings', '/bookings'],
  // API routes that need protection
  api: [
    '/api/admin', '/api/launch-gate', '/api/kill-switches', 
    '/api/analytics/export', '/api/payroll', '/api/audit'
  ]
}

// Role hierarchy for route access
const ROLE_HIERARCHY = {
  owner: 5,
  admin: 4,
  manager: 3,
  staff: 2,
  readonly: 1,
  client: 0,
  system: 6
}

// Minimum role required for each route category
const ROUTE_MIN_ROLE = {
  admin: 4, // admin+
  manager: 3, // manager+
  staff: 2, // staff+
  authenticated: 0 // any authenticated user
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Security headers
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // static files
  ) {
    return res;
  }

  // Check if route needs authentication
  const needsAuth = 
    PROTECTED_ROUTES.admin.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    PROTECTED_ROUTES.manager.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    PROTECTED_ROUTES.staff.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    PROTECTED_ROUTES.authenticated.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    PROTECTED_ROUTES.api.some(route => pathname.startsWith(route));

  if (!needsAuth) {
    return res;
  }

  // Get token from cookies or Authorization header
  const token = req.cookies.get('auth-token')?.value ||
                req.headers.get("authorization")?.replace('Bearer ', '');

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  try {
    // Verify JWT token
    const payload = await verifyToken(token);
    
    // Check route access based on role
    const userRoleLevel = ROLE_HIERARCHY[payload.role as keyof typeof ROLE_HIERARCHY] || 0;

    // Check admin routes
    if (PROTECTED_ROUTES.admin.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userRoleLevel < ROUTE_MIN_ROLE.admin) {
        if (pathname.startsWith('/api')) {
          return NextResponse.json({ error: "insufficient permissions" }, { status: 403 });
        } else {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }
    }

    // Check manager routes
    if (PROTECTED_ROUTES.manager.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userRoleLevel < ROUTE_MIN_ROLE.manager) {
        if (pathname.startsWith('/api')) {
          return NextResponse.json({ error: "insufficient permissions" }, { status: 403 });
        } else {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }
    }

    // Check staff routes
    if (PROTECTED_ROUTES.staff.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userRoleLevel < ROUTE_MIN_ROLE.staff) {
        if (pathname.startsWith('/api')) {
          return NextResponse.json({ error: "insufficient permissions" }, { status: 403 });
        } else {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }
    }

    // Check authenticated routes
    if (PROTECTED_ROUTES.authenticated.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      if (userRoleLevel < ROUTE_MIN_ROLE.authenticated) {
        if (pathname.startsWith('/api')) {
          return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        } else {
          return NextResponse.redirect(new URL('/login', req.url));
        }
      }
    }

    // Check API routes
    if (PROTECTED_ROUTES.api.some(route => pathname.startsWith(route))) {
      if (pathname.startsWith('/api/admin')) {
        if (userRoleLevel < ROUTE_MIN_ROLE.admin) {
          return NextResponse.json({ error: "insufficient permissions" }, { status: 403 });
        }
      }
    }

    // Add user info to headers for client-side usage
    res.headers.set("x-user-id", payload.userId);
    res.headers.set("x-user-email", payload.email || '');
    res.headers.set("x-user-role", payload.role || '');

    return res;
  } catch (error) {
    // Invalid token
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    } else {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - handled separately above
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
