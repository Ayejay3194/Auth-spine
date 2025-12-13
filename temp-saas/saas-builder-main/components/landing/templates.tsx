'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const templates = [
  {
    id: 'saas-starter',
    name: 'SaaS Starter',
    description: 'Complete SaaS foundation with auth, payments, and dashboard',
    category: 'Foundation',
    difficulty: 'Beginner',
    image: '/templates/saas-starter.png',
    features: ['Authentication', 'Stripe Payments', 'User Dashboard', 'Admin Panel']
  },
  {
    id: 'crm-template',
    name: 'CRM System',
    description: 'Customer relationship management with contacts and deals',
    category: 'Business',
    difficulty: 'Intermediate',
    image: '/templates/crm.png',
    features: ['Contact Management', 'Deal Tracking', 'Analytics', 'Team Collaboration']
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Task management and project tracking for teams',
    category: 'Productivity',
    difficulty: 'Intermediate',
    image: '/templates/project-manager.png',
    features: ['Kanban Board', 'Time Tracking', 'Team Management', 'Reports']
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Online marketplace with products and orders',
    category: 'E-commerce',
    difficulty: 'Advanced',
    image: '/templates/ecommerce.png',
    features: ['Product Catalog', 'Shopping Cart', 'Order Management', 'Payment Gateway']
  },
  {
    id: 'learning-platform',
    name: 'Learning Platform',
    description: 'Online course platform with video and quizzes',
    category: 'Education',
    difficulty: 'Intermediate',
    image: '/templates/learning.png',
    features: ['Course Management', 'Video Hosting', 'Quiz System', 'Certificates']
  },
  {
    id: 'social-network',
    name: 'Social Network',
    description: 'Community platform with posts and interactions',
    category: 'Social',
    difficulty: 'Advanced',
    image: '/templates/social.png',
    features: ['User Profiles', 'Feed System', 'Messaging', 'Notifications']
  }
]

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800'
}

export function Templates() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            20+ Production-Ready Templates
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose from our library of professionally designed templates and customize them to fit your needs.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-primary/20">
                    {template.name.charAt(0)}
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    {template.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={difficultyColors[template.difficulty as keyof typeof difficultyColors]}>
                    {template.difficulty}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {template.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/templates/${template.id}`}>
                      Use Template
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/templates">
              View All 20+ Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
