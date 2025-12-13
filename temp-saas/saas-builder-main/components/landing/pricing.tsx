'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for trying out the platform',
    price: 'Free',
    features: [
      '3 Templates',
      'Basic Authentication',
      'Community Support',
      'Documentation Access',
      'MIT License'
    ],
    excluded: [
      'Payment Integration',
      'Advanced Templates',
      'Priority Support',
      'Custom Domains'
    ],
    highlighted: false
  },
  {
    name: 'Professional',
    description: 'For serious SaaS builders',
    price: '$49',
    period: '/month',
    features: [
      'All Templates',
      'Advanced Authentication',
      'Stripe Integration',
      'Email Support',
      'Custom Domains',
      'API Access',
      'Priority Updates'
    ],
    excluded: [
      'Custom Development',
      '1-on-1 Support'
    ],
    highlighted: true,
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    description: 'For teams and large projects',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'Custom Development',
      'Dedicated Support',
      'White-label Options',
      'SLA Guarantee',
      'Custom Integrations',
      'Training Sessions'
    ],
    excluded: [],
    highlighted: false
  }
]

export function Pricing() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.highlighted ? 'border-primary shadow-xl scale-105' : 'border-border'}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.excluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start opacity-50">
                      <div className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="h-px w-3 bg-muted-foreground"></div>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  className="w-full" 
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.price === 'Free' ? 'Get Started' : 
                   plan.price === 'Custom' ? 'Contact Sales' : 
                   'Start Free Trial'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-muted/30 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">30-Day Money Back Guarantee</h3>
            <p className="text-muted-foreground mb-6">
              Try SaaS Builder Kit risk-free. If you're not satisfied, get a full refund within 30 days.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Full access
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
