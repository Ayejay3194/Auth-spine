'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Shield, 
  Palette, 
  CreditCard, 
  Users, 
  Globe,
  Database,
  Code,
  Rocket
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast Setup',
    description: 'Get your SaaS running in under 5 minutes with our automated setup script.',
    badge: 'Popular'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Built-in authentication, authorization, and security best practices.',
    badge: 'Secure'
  },
  {
    icon: Palette,
    title: 'Beautiful Templates',
    description: '20+ professionally designed templates for every SaaS use case.',
  },
  {
    icon: CreditCard,
    title: 'Payment Integration',
    description: 'Stripe integration with subscription management and billing.',
    badge: 'Essential'
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Complete user dashboard with profiles, settings, and team management.',
  },
  {
    icon: Globe,
    title: 'Deployment Ready',
    description: 'One-click deployment to Vercel, Netlify, or your own server.',
  },
  {
    icon: Database,
    title: 'Database Included',
    description: 'PostgreSQL with Prisma ORM and pre-built schemas.',
  },
  {
    icon: Code,
    title: 'Developer Tools',
    description: 'TypeScript, ESLint, Prettier, and comprehensive API documentation.',
  },
  {
    icon: Rocket,
    title: 'Scalable Architecture',
    description: 'Built to scale from startup to enterprise with microservices support.',
  }
]

export function Features() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Launch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No more piecing together different tools. Get everything you need in one comprehensive kit.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              {feature.badge && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button variant="ghost" size="sm" className="p-0 h-auto font-normal text-primary">
                  Learn more →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Card className="mx-auto max-w-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-2">Ready to build your SaaS?</h3>
              <p className="text-muted-foreground mb-4">
                Join thousands of developers who've already launched with SaaS Builder Kit.
              </p>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
