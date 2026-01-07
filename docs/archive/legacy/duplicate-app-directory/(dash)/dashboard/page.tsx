'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle, XCircle, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; success?: boolean }>>([
    {
      role: 'assistant',
      content: 'Welcome to Business Spine! Try commands like:\n• "list bookings for today"\n• "find client alex"\n• "how did we do this week"\n• "run diagnostics" (admin only)',
    },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    const userMessage = query.trim()
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/spine/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userMessage,
          context: {
            userId: 'demo_user',
            role: 'owner',
            tenantId: 'demo_tenant',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      })

      const result = await response.json()

      if (result.success && result.data?.final) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: result.data.final.message || 'Completed successfully',
            success: result.data.final.ok,
          },
        ])
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: result.error?.message || 'An error occurred',
            success: false,
          },
        ])
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to connect to Business Spine API',
          success: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: 'List bookings', command: 'list bookings for today' },
    { label: 'Find client', command: 'find client alex' },
    { label: 'Weekly report', command: 'how did we do this week' },
    { label: 'Run diagnostics', command: 'run diagnostics' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Business Spine Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                <span className="mr-1 h-2 w-2 rounded-full bg-green-600 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : message.success === false
                          ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
                          : message.success === true
                          ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && message.success !== undefined && (
                          message.success ? (
                            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          )
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a command... (e.g., 'list bookings for today')"
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setQuery(action.command)}
                    className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-sm text-gray-900 dark:text-white transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Spines */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Available Spines
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {spines.map((spine) => (
                  <div key={spine} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>{spine}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const stats = [
  { name: 'Today\'s Bookings', value: '12', icon: Calendar },
  { name: 'Active Clients', value: '48', icon: Users },
  { name: 'Weekly Revenue', value: '$2.4k', icon: DollarSign },
  { name: 'Growth', value: '+12%', icon: TrendingUp },
]

const spines = [
  'Booking',
  'CRM',
  'Payments',
  'Marketing',
  'Analytics',
  'Admin/Security',
  'Diagnostics',
]
