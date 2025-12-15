import Link from 'next/link'
import { ArrowRight, Zap, Shield, DollarSign, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Business Spine
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Deterministic assistant for service businesses. Fast, reliable, and predictable - 
              no AI unpredictability, no per-query costs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/api/spine/health"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary transition-colors"
              >
                API Health <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Perfect for Service Businesses
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to run your business
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white dark:bg-slate-800 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-16">
            Perfect For
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="relative rounded-lg border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-900 p-6 hover:border-primary transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            Start using Business Spine today. No setup required, no credit card needed.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/dashboard"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
            >
              Open Dashboard
            </Link>
            <Link
              href="/swagger"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary transition-colors"
            >
              View API Docs <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    name: 'Lightning Fast',
    description: '<10ms response time vs 500-5000ms for LLMs. Your staff works at the speed of thought.',
    icon: Zap,
  },
  {
    name: 'Zero Query Costs',
    description: '$0 per query vs $0.01-$0.10 for LLMs. Predictable pricing, unlimited usage.',
    icon: DollarSign,
  },
  {
    name: '100% Reliable',
    description: 'Deterministic = predictable. No hallucinations, no surprises, no "AI went crazy" moments.',
    icon: Shield,
  },
  {
    name: 'Save Time',
    description: 'Staff work 3-5x faster with natural language commands instead of clicking through menus.',
    icon: Clock,
  },
]

const useCases = [
  {
    title: 'Salons & Spas',
    description: 'Fast booking, client preferences, payment processing. Perfect for busy front desks.',
  },
  {
    title: 'Gyms & Fitness',
    description: 'Member management, class scheduling, billing automation. Keep members engaged.',
  },
  {
    title: 'Medical & Dental',
    description: 'HIPAA-compliant operations with audit trails. Patient safety first.',
  },
  {
    title: 'Massage & Wellness',
    description: 'Client preferences, packages, promotions. Personalized care at scale.',
  },
  {
    title: 'Pet Grooming',
    description: 'Pet notes, safety flags, owner management. Every pet gets the right care.',
  },
  {
    title: 'Home Services',
    description: 'Route scheduling, recurring bookings, preferences. Efficiency meets quality.',
  },
]
