import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Auth-Spine Platform
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Universal business automation platform with operations spine, AI assistant, and multi-tenant architecture
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
              ✓ 146/146 Features
            </span>
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
              Production Ready
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Core Platform */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h2 className="text-xl font-semibold text-white mb-3">Core Platform</h2>
            <ul className="text-slate-300 space-y-2">
              <li>✓ 40+ API endpoints</li>
              <li>✓ 6 Business spines</li>
              <li>✓ Multi-tenant architecture</li>
              <li>✓ Payment processing</li>
            </ul>
          </div>

          {/* Operations Spine */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h2 className="text-xl font-semibold text-white mb-3">Operations Spine</h2>
            <ul className="text-slate-300 space-y-2">
              <li>✓ Audit trails</li>
              <li>✓ Feature flags</li>
              <li>✓ Health monitoring</li>
              <li>✓ Incident response</li>
            </ul>
          </div>

          {/* AI Assistant */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h2 className="text-xl font-semibold text-white mb-3">AI Assistant</h2>
            <ul className="text-slate-300 space-y-2">
              <li>✓ 16 AI engines</li>
              <li>✓ Predictive scheduling</li>
              <li>✓ Dynamic pricing</li>
              <li>✓ Financial forecasting</li>
            </ul>
          </div>

          {/* Security */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h2 className="text-xl font-semibold text-white mb-3">Security</h2>
            <ul className="text-slate-300 space-y-2">
              <li>✓ JWT + OAuth</li>
              <li>✓ MFA support</li>
              <li>✓ CSRF protection</li>
              <li>✓ API key management</li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h2 className="text-xl font-semibold text-white mb-3">Infrastructure</h2>
            <ul className="text-slate-300 space-y-2">
              <li>✓ Docker + Kubernetes</li>
              <li>✓ Terraform configs</li>
              <li>✓ Redis caching</li>
              <li>✓ Prometheus metrics</li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
            <h2 className="text-xl font-semibold text-white mb-3">Compliance</h2>
            <ul className="text-slate-300 space-y-2">
              <li>✓ GDPR/CCPA ready</li>
              <li>✓ HIPAA patterns</li>
              <li>✓ SOC 2 patterns</li>
              <li>✓ Audit trails</li>
            </ul>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700 mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Key API Endpoints</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Authentication</h3>
              <ul className="space-y-2 text-sm text-slate-400 font-mono">
                <li className="hover:text-slate-300 transition-colors">/api/auth/login</li>
                <li className="hover:text-slate-300 transition-colors">/api/auth/logout</li>
                <li className="hover:text-slate-300 transition-colors">/api/auth/mfa/start</li>
                <li className="hover:text-slate-300 transition-colors">/api/auth/apikey/create</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Booking</h3>
              <ul className="space-y-2 text-sm text-slate-400 font-mono">
                <li className="hover:text-slate-300 transition-colors">/api/booking/slots</li>
                <li className="hover:text-slate-300 transition-colors">/api/booking/create</li>
                <li className="hover:text-slate-300 transition-colors">/api/booking/cancel</li>
                <li className="hover:text-slate-300 transition-colors">/api/booking/reschedule</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Providers</h3>
              <ul className="space-y-2 text-sm text-slate-400 font-mono">
                <li className="hover:text-slate-300 transition-colors">/api/providers</li>
                <li className="hover:text-slate-300 transition-colors">/api/providers/[id]</li>
                <li className="hover:text-slate-300 transition-colors">/api/discovery/search</li>
                <li className="hover:text-slate-300 transition-colors">/api/reviews</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-300 mb-3">Operations</h3>
              <ul className="space-y-2 text-sm text-slate-400 font-mono">
                <li className="hover:text-slate-300 transition-colors">/api/metrics</li>
                <li className="hover:text-slate-300 transition-colors">/api/ops/auth</li>
                <li className="hover:text-slate-300 transition-colors">/api/ops/auth/metrics</li>
                <li className="hover:text-slate-300 transition-colors">/api/openapi.json</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Links</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/swagger" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
            >
              API Documentation
            </Link>
            <Link 
              href="/dashboard" 
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/auth-ops" 
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
            >
              Operations Panel
            </Link>
            <a 
              href="/api/metrics" 
              target="_blank"
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold"
            >
              Metrics
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>Auth-Spine Platform v2.0 | Production Ready | 146/146 Features Complete</p>
        </div>
      </div>
    </main>
  );
}
