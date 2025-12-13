import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/api/protected/:path*"]
}
