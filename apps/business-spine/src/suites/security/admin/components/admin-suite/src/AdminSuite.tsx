import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Shield,
  Code,
  Server,
  Database,
  Lock,
  Zap,
  Play,
  Settings,
  FileText,
} from "lucide-react";

type Result = "pass" | "fail" | "pending";

type InfraTest = {
  id: string;
  test: string;
  critical: boolean;
  fix: string;
};

type InfraCategory = {
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tests: InfraTest[];
};

type CodeCheck = {
  id: string;
  check: string;
  critical: boolean;
  fix: string;
  common: string;
};

type CodeCategory = {
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  checks: CodeCheck[];
};

const AdminSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"infrastructure" | "code">("infrastructure");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, Result>>({});
  const [codeIssues, setCodeIssues] = useState<Record<string, Result>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const infrastructureTests: InfraCategory[] = useMemo(
    () => [
      {
        category: "Architecture & Design",
        icon: Server,
        tests: [
          { id: "arch1", test: "Architecture documentation exists and is up-to-date", critical: true, fix: "Create/update architecture.md with system components, data flow, and dependencies" },
          { id: "arch2", test: "System components and dependencies are mapped", critical: true, fix: "Use tools like draw.io or Mermaid to create dependency diagrams" },
          { id: "arch3", test: "Scalability requirements are defined and documented", critical: false, fix: "Document expected load, users, and growth projections in requirements.md" },
          { id: "arch4", test: "Failure modes identified and mitigation strategies documented", critical: true, fix: "Create failure-modes.md listing what can fail and how to handle it" },
          { id: "arch5", test: "Data flow diagrams exist for all major processes", critical: false, fix: "Document data flow from user input through processing to storage" },
          { id: "arch6", test: "Service boundaries are clearly defined", critical: true, fix: "Define which service owns what data and functionality" },
          { id: "arch7", test: "API contracts are versioned and documented", critical: true, fix: "Use OpenAPI/Swagger specs for all APIs" },
        ],
      },
      {
        category: "Security",
        icon: Lock,
        tests: [
          { id: "sec1", test: "All credentials are stored in secrets management (no hardcoded secrets)", critical: true, fix: "Use environment variables or a secrets manager; never commit secrets" },
          { id: "sec2", test: "Encryption at rest enabled for all sensitive data stores", critical: true, fix: "Enable database encryption, encrypt object storage with KMS-equivalent keys" },
          { id: "sec3", test: "TLS/SSL certificates are valid and not expiring within 30 days", critical: true, fix: "Set up automated certificate renewal and alerts for expiry" },
          { id: "sec4", test: "All network traffic uses encryption in transit", critical: true, fix: "Enforce HTTPS; use TLS for database connections" },
          { id: "sec5", test: "Firewall rules follow least privilege", critical: true, fix: "Remove any 0.0.0.0/0 where not required; restrict by IP / private networks" },
          { id: "sec6", test: "Multi-factor authentication enforced for privileged access", critical: true, fix: "Enforce MFA for all admin/privileged accounts" },
          { id: "sec7", test: "Regular security scanning (SAST/DAST) is automated", critical: true, fix: "Integrate scanning tools in CI/CD (dependency + code + DAST)" },
          { id: "sec8", test: "Vulnerability management process is in place", critical: true, fix: "Enable dependency alerts and schedule regular reviews" },
          { id: "sec9", test: "Access logs are enabled and retained", critical: true, fix: "Enable request/access/audit logs; set retention based on compliance needs" },
          { id: "sec10", test: "Penetration testing conducted within last 12 months", critical: false, fix: "Schedule external pen test or run a documented internal program" },
          { id: "sec11", test: "WAF configured with appropriate rules", critical: true, fix: "Apply OWASP Top 10 protections (managed rules if possible)" },
          { id: "sec12", test: "DDoS protection is enabled", critical: false, fix: "Enable provider-level DDoS protections and rate limiting" },
          { id: "sec13", test: "API rate limiting is configured", critical: true, fix: "Implement rate limiting at gateway or app level" },
        ],
      },
      {
        category: "Data & Storage",
        icon: Database,
        tests: [
          { id: "datai1", test: "Automated backups are configured", critical: true, fix: "Enable automated backups, object versioning, and snapshot schedules" },
          { id: "datai2", test: "Backup restoration has been tested within last 90 days", critical: true, fix: "Run quarterly restore drills; document procedures" },
          { id: "datai3", test: "Database replication is configured", critical: true, fix: "Set up read replicas / multi-AZ / failover strategy" },
          { id: "datai4", test: "Point-in-time recovery is enabled", critical: true, fix: "Enable PITR/transaction logs and validate restore points" },
          { id: "datai5", test: "Data retention policies are defined and enforced", critical: true, fix: "Define retention; implement automated cleanup jobs" },
          { id: "datai6", test: "Database connection pooling is configured", critical: false, fix: "Use a pooler and tune max connections" },
          { id: "datai7", test: "Database indexes are optimized", critical: false, fix: "EXPLAIN slow queries; add indexes on hot paths" },
          { id: "datai8", test: "Slow query logging is enabled", critical: true, fix: "Enable slow query logs and tune threshold" },
          { id: "datai9", test: "Storage capacity monitoring and alerting configured", critical: true, fix: "Set alerts for disk/usage thresholds" },
          { id: "datai10", test: "Data residency requirements are met", critical: true, fix: "Document residency rules; enforce region constraints" },
        ],
      },
      {
        category: "Monitoring & Observability",
        icon: Zap,
        tests: [
          { id: "mon1", test: "Centralized logging is implemented", critical: true, fix: "Ship logs to a centralized system with search" },
          { id: "mon2", test: "Log retention policy is defined and enforced", critical: true, fix: "Define retention and enforce it automatically" },
          { id: "mon3", test: "Application performance monitoring (APM) is configured", critical: true, fix: "Add APM traces/metrics for latency and errors" },
          { id: "mon4", test: "Distributed tracing is implemented", critical: false, fix: "Instrument with OpenTelemetry" },
          { id: "mon5", test: "Key metrics dashboards exist", critical: true, fix: "Dashboards for request rate, error rate, latency, saturation" },
          { id: "mon6", test: "Alerting rules are configured for critical services", critical: true, fix: "Alerts for high error rate, latency spikes, service down" },
          { id: "mon7", test: "Alerts are actionable and have runbooks", critical: true, fix: "Runbooks for each alert with steps + owners" },
          { id: "mon8", test: "Alert fatigue is managed (low false positive rate)", critical: true, fix: "Tune thresholds and reduce noisy alerts" },
          { id: "mon9", test: "On-call rotation is defined", critical: true, fix: "Define on-call ownership and escalation" },
          { id: "mon10", test: "Synthetic monitoring/uptime checks are configured", critical: true, fix: "External checks to /health and key journeys" },
          { id: "mon11", test: "Error tracking and aggregation is implemented", critical: true, fix: "Aggregate exceptions and attach context" },
        ],
      },
      {
        category: "Deployment & CI/CD",
        icon: Play,
        tests: [
          { id: "cicd1", test: "Automated deployment pipeline exists", critical: true, fix: "Create CI/CD pipeline for build/test/deploy" },
          { id: "cicd2", test: "Automated testing runs before deployment", critical: true, fix: "Gate deployments on test success" },
          { id: "cicd3", test: "Code review is required before merging", critical: true, fix: "Protect main branch and require PR review" },
          { id: "cicd4", test: "Rollback procedure is documented and tested", critical: true, fix: "Document rollback; rehearse regularly" },
          { id: "cicd5", test: "Infrastructure as code is version controlled", critical: true, fix: "Use IaC and keep it in git" },
          { id: "cicd6", test: "Environment parity (dev/staging/prod) is maintained", critical: true, fix: "Keep configs aligned; avoid snowflake prod" },
          { id: "cicd7", test: "Deployment strategy (blue-green/canary) is implemented", critical: false, fix: "Implement safe rollout strategy" },
          { id: "cicd8", test: "Deployment approvals are required for production", critical: true, fix: "Require explicit approvals for prod deploys" },
          { id: "cicd9", test: "Secrets are not stored in version control", critical: true, fix: "Ignore secrets; scan repo history" },
          { id: "cicd10", test: "Build artifacts are versioned and stored", critical: true, fix: "Tag images/artifacts and store in registry" },
        ],
      },
    ],
    []
  );

  const codeQualityChecks: CodeCategory[] = useMemo(
    () => [
      {
        category: "Common Vibe Coding Errors",
        icon: Code,
        checks: [
          { id: "vibe1", check: "No undefined variables or functions", critical: true, fix: "Run ESLint/TS; check imports and declarations", common: "Missing imports, typos in names" },
          { id: "vibe2", check: "No missing semicolons or syntax errors", critical: true, fix: "Use Prettier + editor diagnostics", common: "Missing commas/brackets/parentheses" },
          { id: "vibe3", check: "All API endpoints are actually implemented", critical: true, fix: "Test all routes with a runner; ensure handlers exist", common: "Routes declared but handlers missing" },
          { id: "vibe4", check: "Environment variables are properly loaded", critical: true, fix: "Validate env at startup; document .env.example", common: "Wrong env var names; dotenv not loaded" },
          { id: "vibe5", check: "Database connections are properly closed", critical: true, fix: "Use pools and close resources in finally", common: "Leaky connections under load" },
          { id: "vibe6", check: "Error handling exists for all async operations", critical: true, fix: "Wrap async in try/catch; handle promise rejections", common: "Unhandled promise rejection crashes" },
          { id: "vibe7", check: "CORS is properly configured", critical: true, fix: "Restrict origins; configure CORS middleware", common: "Frontend can't reach API" },
          { id: "vibe8", check: "Port conflicts resolved", critical: true, fix: "Use env-based ports; document allocations", common: "Everything tries port 3000" },
          { id: "vibe9", check: "File paths work across OSes", critical: false, fix: "Use path.join / URL APIs", common: "Hardcoded / or \\ breaks on some OSes" },
          { id: "vibe10", check: "All dependencies are declared", critical: true, fix: "Ensure package.json lockfile is correct", common: "Works locally, fails in CI/prod" },
        ],
      },
      {
        category: "Data Handling Issues",
        icon: Database,
        checks: [
          { id: "dh1", check: "No SQL injection vulnerabilities", critical: true, fix: "Parameterized queries; never concatenate input", common: "Template literal SQL strings" },
          { id: "dh2", check: "Input validation on all user-submitted data", critical: true, fix: "Schema-validate requests; reject bad inputs", common: "Trusting user payloads" },
          { id: "dh3", check: "Null/undefined checks before accessing properties", critical: true, fix: "Optional chaining + guards", common: "Cannot read property of undefined" },
          { id: "dh4", check: "JSON parsing errors are handled", critical: true, fix: "Try/catch JSON.parse; validate shape", common: "Malformed JSON crashes app" },
          { id: "dh5", check: "Large file uploads handled properly", critical: false, fix: "Streaming uploads; size limits", common: "OOM / timeouts on large files" },
          { id: "dh6", check: "Date/time handling accounts for timezones", critical: false, fix: "Store UTC; convert for display", common: "Wrong times in other regions" },
          { id: "dh7", check: "Pagination for large datasets", critical: false, fix: "Limit queries; cursor pagination", common: "Loading 100k rows freezes UI" },
          { id: "dh8", check: "Race conditions in concurrent ops handled", critical: true, fix: "Transactions + idempotency + locking as needed", common: "Concurrent edits corrupt state" },
        ],
      },
      {
        category: "Authentication & Authorization",
        icon: Shield,
        checks: [
          { id: "auth1", check: "Passwords are hashed (never stored plain text)", critical: true, fix: "Use bcrypt/argon2/scrypt", common: "Plaintext passwords in DB" },
          { id: "auth2", check: "JWT tokens have expiration times", critical: true, fix: "Set exp + refresh token strategy", common: "Tokens never expire" },
          { id: "auth3", check: "Protected routes check authentication", critical: true, fix: "Apply auth middleware to protected routes", common: "Middleware exists but isn't used" },
          { id: "auth4", check: "Authorization checks exist (not only auth)", critical: true, fix: "Check roles/ownership per action", common: "Any user can hit admin endpoints" },
          { id: "auth5", check: "Session management is secure", critical: true, fix: "Secure, httpOnly cookies; CSRF protection", common: "localStorage sessions; XSS snack time" },
          { id: "auth6", check: "Rate limiting on login attempts", critical: true, fix: "Add server-side rate limiter", common: "Brute force party" },
          { id: "auth7", check: "Logout invalidates sessions", critical: true, fix: "Short-lived access + refresh revocation", common: "Client deletes token, server still accepts it" },
        ],
      },
      {
        category: "Frontend Issues",
        icon: Code,
        checks: [
          { id: "fe1", check: "No memory leaks (listeners cleaned up)", critical: false, fix: "Cleanup in useEffect return()", common: "Listeners accumulate forever" },
          { id: "fe2", check: "Loading states for async operations", critical: false, fix: "Skeletons/spinners + disabled buttons", common: "Blank UI while fetching" },
          { id: "fe3", check: "Error states displayed to users", critical: true, fix: "Render an error banner/toast with context", common: "Errors only in console" },
          { id: "fe4", check: "Forms have validation feedback", critical: false, fix: "Inline field errors and summaries", common: "Submit fails silently" },
          { id: "fe5", check: "No infinite loops in effects/render", critical: true, fix: "Fix deps arrays; avoid setState loops", common: "Missing deps; re-render spiral" },
          { id: "fe6", check: "List keys are unique and stable", critical: false, fix: "Use IDs, not indices", common: "Index keys cause weird UI bugs" },
          { id: "fe7", check: "API calls don't happen on every render", critical: true, fix: "Use useEffect/React Query; memoize deps", common: "Hundreds of calls on load" },
          { id: "fe8", check: "Mobile responsive design", critical: false, fix: "Responsive layout + device testing", common: "Desktop-only sadness" },
        ],
      },
      {
        category: "Performance Issues",
        icon: Zap,
        checks: [
          { id: "perf1", check: "No N+1 query problems", critical: true, fix: "Eager load / joins; cap query counts", common: "Loop that queries DB per item" },
          { id: "perf2", check: "Large images are optimized", critical: false, fix: "Compress, WebP/AVIF, lazy load", common: "10MB images for a 200px thumbnail" },
          { id: "perf3", check: "Unnecessary re-renders are prevented", critical: false, fix: "Memoize heavy components; stable props", common: "Whole tree re-renders on tiny state change" },
          { id: "perf4", check: "DB queries have proper indexes", critical: true, fix: "Index hot filters/sorts", common: "Full table scans" },
          { id: "perf5", check: "No blocking operations in event loop", critical: true, fix: "Async I/O; workers for CPU-heavy tasks", common: "Sync crypto/file ops blocking server" },
          { id: "perf6", check: "Caching where appropriate", critical: false, fix: "Cache expensive reads; invalidate correctly", common: "Recompute same stuff every request" },
        ],
      },
      {
        category: "Deployment & Config",
        icon: Settings,
        checks: [
          { id: "dep1", check: "Environment-specific configs don't leak", critical: true, fix: "Never commit secrets; separate env configs", common: ".env committed to git" },
          { id: "dep2", check: "Build process completes successfully", critical: true, fix: "Run build in CI; fix build errors", common: "Works in dev; build fails" },
          { id: "dep3", check: "Required env vars are documented", critical: true, fix: "Create .env.example and docs", common: "Prod crashes due to missing env vars" },
          { id: "dep4", check: "Health check endpoint exists", critical: true, fix: "Add /health returning 200 OK", common: "LB can't tell health" },
          { id: "dep5", check: "Logging doesn't expose sensitive data", critical: true, fix: "Redact tokens/PII; structured logs", common: "Passwords/tokens in logs" },
          { id: "dep6", check: "Graceful shutdown implemented", critical: false, fix: "Handle SIGTERM; drain requests", common: "Killed mid-request; corruption" },
          { id: "dep7", check: "Static files served correctly in prod", critical: true, fix: "Configure static hosting and paths", common: "CSS/JS 404s" },
        ],
      },
    ],
    []
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleResultChange = (id: string, value: Result) => {
    if (activeTab === "infrastructure") setTestResults((p) => ({ ...p, [id]: value }));
    else setCodeIssues((p) => ({ ...p, [id]: value }));
  };

  const handleNoteChange = (id: string, note: string) => {
    setNotes((prev) => ({ ...prev, [id]: note }));
  };

  const getInfraStats = () => {
    const total = infrastructureTests.reduce((sum, cat) => sum + cat.tests.length, 0);
    const completed = Object.keys(testResults).length;
    const passed = Object.values(testResults).filter((v) => v === "pass").length;
    const failed = Object.values(testResults).filter((v) => v === "fail").length;
    const critical = infrastructureTests.reduce(
      (sum, cat) => sum + cat.tests.filter((t) => t.critical && testResults[t.id] === "fail").length,
      0
    );
    return { total, completed, passed, failed, critical };
  };

  const getCodeStats = () => {
    const total = codeQualityChecks.reduce((sum, cat) => sum + cat.checks.length, 0);
    const completed = Object.keys(codeIssues).length;
    const passed = Object.values(codeIssues).filter((v) => v === "pass").length;
    const failed = Object.values(codeIssues).filter((v) => v === "fail").length;
    const critical = codeQualityChecks.reduce(
      (sum, cat) => sum + cat.checks.filter((c) => c.critical && codeIssues[c.id] === "fail").length,
      0
    );
    return { total, completed, passed, failed, critical };
  };

  const exportReport = () => {
    const infraStats = getInfraStats();
    const codeStats = getCodeStats();

    let report = `COMPLETE INFRASTRUCTURE & CODE QUALITY AUDIT REPORT\n`;
    report += `${"=".repeat(60)}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n\n`;

    report += `INFRASTRUCTURE TESTING SUMMARY\n`;
    report += `${"-".repeat(60)}\n`;
    report += `Total Tests: ${infraStats.total}\n`;
    report += `Completed: ${infraStats.completed}\n`;
    report += `Passed: ${infraStats.passed}\n`;
    report += `Failed: ${infraStats.failed}\n`;
    report += `Critical Failures: ${infraStats.critical}\n`;
    report += `Completion: ${Math.round((infraStats.completed / Math.max(infraStats.total, 1)) * 100)}%\n\n`;

    report += `CODE QUALITY SUMMARY\n`;
    report += `${"-".repeat(60)}\n`;
    report += `Total Checks: ${codeStats.total}\n`;
    report += `Completed: ${codeStats.completed}\n`;
    report += `Passed: ${codeStats.passed}\n`;
    report += `Failed: ${codeStats.failed}\n`;
    report += `Critical Issues: ${codeStats.critical}\n`;
    report += `Completion: ${Math.round((codeStats.completed / Math.max(codeStats.total, 1)) * 100)}%\n\n`;

    report += `\nINFRASTRUCTURE DETAILED RESULTS\n`;
    report += `${"=".repeat(60)}\n`;
    infrastructureTests.forEach((category) => {
      report += `\n${category.category}\n${"-".repeat(category.category.length)}\n`;
      category.tests.forEach((test) => {
        const result = testResults[test.id] || "pending";
        const status = result === "pass" ? "✓" : result === "fail" ? "✗" : "○";
        const criticalTag = test.critical ? "[CRITICAL]" : "";
        report += `${status} ${test.test} ${criticalTag}\n`;
        if (result === "fail") report += `   FIX: ${test.fix}\n`;
        if (notes[test.id]) report += `   NOTE: ${notes[test.id]}\n`;
      });
    });

    report += `\n\nCODE QUALITY DETAILED RESULTS\n`;
    report += `${"=".repeat(60)}\n`;
    codeQualityChecks.forEach((category) => {
      report += `\n${category.category}\n${"-".repeat(category.category.length)}\n`;
      category.checks.forEach((check) => {
        const result = codeIssues[check.id] || "pending";
        const status = result === "pass" ? "✓" : result === "fail" ? "✗" : "○";
        const criticalTag = check.critical ? "[CRITICAL]" : "";
        report += `${status} ${check.check} ${criticalTag}\n`;
        if (result === "fail") {
          report += `   COMMON ISSUE: ${check.common}\n`;
          report += `   FIX: ${check.fix}\n`;
        }
        if (notes[check.id]) report += `   NOTE: ${notes[check.id]}\n`;
      });
    });

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complete-audit-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentStats = activeTab === "infrastructure" ? getInfraStats() : getCodeStats();
  const completionPercent = Math.round((currentStats.completed / Math.max(currentStats.total, 1)) * 100);

  const categories = activeTab === "infrastructure" ? infrastructureTests : codeQualityChecks;

  const ResultPill: React.FC<{ value: Result }> = ({ value }) => {
    if (value === "pass")
      return (
        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs">
          <CheckCircle2 size={14} />
          Pass
        </span>
      );
    if (value === "fail")
      return (
        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-xs">
          <XCircle size={14} />
          Fail
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full text-xs">
        <FileText size={14} />
        Pending
      </span>
    );
  };

  const getValue = (id: string): Result => {
    if (activeTab === "infrastructure") return testResults[id] || "pending";
    return codeIssues[id] || "pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-2xl p-8 mb-6 text-white">
          <h1 className="text-4xl font-bold mb-2">Complete Admin Suite</h1>
          <p className="text-blue-100 mb-4">Infrastructure Testing + Code Quality Verification</p>

          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("infrastructure")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "infrastructure" ? "bg-white text-blue-600 shadow-lg" : "bg-blue-500/30 hover:bg-blue-500/50"
              }`}
            >
              <Server size={20} />
              Infrastructure Tests
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "code" ? "bg-white text-purple-600 shadow-lg" : "bg-purple-500/30 hover:bg-purple-500/50"
              }`}
            >
              <Code size={20} />
              Code Quality Checks
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{currentStats.total}</div>
              <div className="text-sm text-slate-600">Total {activeTab === "infrastructure" ? "Tests" : "Checks"}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{currentStats.passed}</div>
              <div className="text-sm text-slate-600">Passed</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-700">{currentStats.failed}</div>
              <div className="text-sm text-slate-600">Failed</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{currentStats.critical}</div>
              <div className="text-sm text-slate-600">Critical Issues</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{completionPercent}%</div>
              <div className="text-sm text-slate-600">Complete</div>
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-4 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-3 rounded-lg hover:from-slate-600 hover:to-slate-800 transition-all shadow-lg"
          >
            <Download size={18} />
            Export Complete Report
          </button>
        </div>

        {currentStats.critical > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 border-l-4 border-red-700 p-4 mb-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertCircle size={24} />
              CRITICAL ISSUES DETECTED - DEPLOYMENT BLOCKED
            </div>
            <p className="text-red-100">
              You have {currentStats.critical} critical {activeTab === "infrastructure" ? "infrastructure tests" : "code checks"} failing. Fix them before
              you ship and pretend it was “just a quick deploy”.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const expanded = expandedCategories[cat.category] ?? true;

            const rows =
              activeTab === "infrastructure"
                ? (cat as InfraCategory).tests.map((t) => ({ id: t.id, title: t.test, critical: t.critical, fix: t.fix, common: undefined as string | undefined }))
                : (cat as CodeCategory).checks.map((c) => ({ id: c.id, title: c.check, critical: c.critical, fix: c.fix, common: c.common }));

            return (
              <div key={cat.category} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition" onClick={() => toggleCategory(cat.category)}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 text-white">
                      <Icon size={20} />
                    </span>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">{cat.category}</div>
                      <div className="text-sm text-slate-500">{rows.length} items</div>
                    </div>
                  </div>
                  {expanded ? <ChevronDown size={20} className="text-slate-600" /> : <ChevronRight size={20} className="text-slate-600" />}
                </button>

                {expanded && (
                  <div className="border-t border-slate-200">
                    {rows.map((row) => {
                      const value = getValue(row.id);
                      return (
                        <div key={row.id} className="p-5 border-b border-slate-100">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <ResultPill value={value} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">
                                {row.title}
                                {row.critical && (
                                  <span className="ml-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">CRITICAL</span>
                                )}
                              </div>

                              {value === "fail" && (
                                <div className="mt-2 text-sm text-slate-700">
                                  {row.common && (
                                    <div className="mb-1">
                                      <span className="font-semibold">Common:</span> {row.common}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-semibold">Fix:</span> {row.fix}
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                                <button
                                  onClick={() => handleResultChange(row.id, "pass")}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition ${
                                    value === "pass" ? "bg-green-600 text-white border-green-600" : "bg-white hover:bg-green-50 border-slate-200"
                                  }`}
                                >
                                  <CheckCircle2 size={18} />
                                  Pass
                                </button>
                                <button
                                  onClick={() => handleResultChange(row.id, "fail")}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition ${
                                    value === "fail" ? "bg-red-600 text-white border-red-600" : "bg-white hover:bg-red-50 border-slate-200"
                                  }`}
                                >
                                  <XCircle size={18} />
                                  Fail
                                </button>
                                <button
                                  onClick={() => handleResultChange(row.id, "pending")}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition ${
                                    value === "pending" ? "bg-slate-800 text-white border-slate-800" : "bg-white hover:bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  <FileText size={18} />
                                  Pending
                                </button>
                              </div>

                              <div className="mt-3">
                                <label className="text-sm font-semibold text-slate-700">Notes</label>
                                <textarea
                                  value={notes[row.id] || ""}
                                  onChange={(e) => handleNoteChange(row.id, e.target.value)}
                                  rows={2}
                                  placeholder="Add context, links, owners, dates, whatever keeps Future You from crying."
                                  className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center text-slate-400 text-xs mt-8">Built to prevent “it worked on my machine” from becoming a lifestyle.</div>
      </div>
    </div>
  );
};

export default AdminSuite;
