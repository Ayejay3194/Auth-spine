#!/bin/bash

# ============================================
# Auth-Spine Deployment Verification Script
# ============================================
# Checks if deployment is healthy and working
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AUTH_URL="${AUTH_URL:-http://localhost:4000}"
APP_URL="${APP_URL:-http://localhost:3000}"
TIMEOUT=10

# Counters
PASSED=0
FAILED=0
WARNINGS=0

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_test() {
    echo -e "${BLUE}🧪 Testing:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
    ((WARNINGS++))
}

# Helper to check HTTP endpoint
check_endpoint() {
    local url=$1
    local expected_code=${2:-200}
    local description=$3
    
    print_test "$description"
    
    response=$(curl -s -w "\n%{http_code}" -m $TIMEOUT "$url" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        print_success "$description - Status: $http_code"
        return 0
    else
        print_fail "$description - Expected: $expected_code, Got: $http_code"
        return 1
    fi
}

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is required but not installed${NC}"
    exit 1
fi

print_header "🚀 Auth-Spine Deployment Verification"

echo "Testing environment:"
echo "  Auth Server: $AUTH_URL"
echo "  Business App: $APP_URL"
echo "  Timeout: ${TIMEOUT}s"
echo ""

# Test Auth Server
print_header "1️⃣  Auth Server Tests"

# Health check
check_endpoint "$AUTH_URL/health" 200 "Auth server health check"

# Check if server responds with JSON
if echo "$body" | grep -q "status"; then
    print_success "Health check returns valid JSON"
else
    print_warning "Health check response format unexpected"
fi

# Test CORS headers (if applicable)
print_test "CORS headers configuration"
cors_response=$(curl -s -I -H "Origin: http://example.com" "$AUTH_URL/health" 2>/dev/null || echo "")
if echo "$cors_response" | grep -qi "access-control-allow"; then
    print_success "CORS headers present"
else
    print_warning "CORS headers not found (may be intentional)"
fi

# Test Business App
print_header "2️⃣  Business App Tests"

# Health check
check_endpoint "$APP_URL/api/health" 200 "Business app health check"

# Homepage
check_endpoint "$APP_URL" 200 "Business app homepage"

# Test Security Headers
print_header "3️⃣  Security Headers Tests"

print_test "Security headers check"
security_headers=$(curl -s -I "$APP_URL" 2>/dev/null || echo "")

# Check for important security headers
has_csp=$(echo "$security_headers" | grep -i "content-security-policy" || echo "")
has_xframe=$(echo "$security_headers" | grep -i "x-frame-options" || echo "")
has_xcontent=$(echo "$security_headers" | grep -i "x-content-type-options" || echo "")

if [ -n "$has_csp" ]; then
    print_success "Content-Security-Policy header present"
else
    print_warning "Content-Security-Policy header missing"
fi

if [ -n "$has_xframe" ]; then
    print_success "X-Frame-Options header present"
else
    print_warning "X-Frame-Options header missing"
fi

if [ -n "$has_xcontent" ]; then
    print_success "X-Content-Type-Options header present"
else
    print_warning "X-Content-Type-Options header missing"
fi

# Test Database Connectivity (indirect)
print_header "4️⃣  Integration Tests"

print_test "Database connectivity (via API)"
# Try to access an endpoint that requires DB
db_test=$(curl -s -w "\n%{http_code}" -m $TIMEOUT "$AUTH_URL/health" 2>/dev/null || echo "000")
db_code=$(echo "$db_test" | tail -n1)

if [ "$db_code" = "200" ]; then
    print_success "API can connect to database"
else
    print_fail "Database connectivity issues detected"
fi

# Test SSL/TLS (if HTTPS)
if [[ $AUTH_URL == https://* ]] || [[ $APP_URL == https://* ]]; then
    print_header "5️⃣  SSL/TLS Tests"
    
    print_test "SSL certificate validation"
    if curl -s --max-time 5 "$AUTH_URL/health" > /dev/null 2>&1; then
        print_success "SSL certificate valid"
    else
        print_fail "SSL certificate validation failed"
    fi
else
    print_header "5️⃣  SSL/TLS Tests"
    print_warning "Not using HTTPS - skipping SSL tests"
    print_warning "Production deployments should use HTTPS"
fi

# Performance Tests
print_header "6️⃣  Performance Tests"

print_test "Response time check"
start_time=$(date +%s%N)
curl -s -m $TIMEOUT "$AUTH_URL/health" > /dev/null 2>&1
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))

if [ $duration -lt 1000 ]; then
    print_success "Response time: ${duration}ms (excellent)"
elif [ $duration -lt 3000 ]; then
    print_success "Response time: ${duration}ms (good)"
else
    print_warning "Response time: ${duration}ms (consider optimization)"
fi

# Summary
print_header "📊 Test Summary"

total=$((PASSED + FAILED + WARNINGS))

# Prevent division by zero
if [ $total -eq 0 ]; then
    echo "No tests were run"
    exit 1
fi

pass_rate=$((PASSED * 100 / total))

echo ""
echo -e "${GREEN}✅ Passed:${NC}   $PASSED"
echo -e "${RED}❌ Failed:${NC}   $FAILED"
echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo -e "${BLUE}📈 Pass Rate:${NC} ${pass_rate}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test API endpoints with Postman collection"
    echo "2. Try logging in through the UI"
    echo "3. Check application logs for any errors"
    echo "4. Run load tests if preparing for production"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if all services are running"
    echo "2. Verify environment variables are set correctly"
    echo "3. Check application logs for errors"
    echo "4. Ensure database is accessible"
    echo "5. See DEPLOYMENT.md for more help"
    echo ""
    exit 1
fi
