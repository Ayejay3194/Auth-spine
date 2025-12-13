'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, ArrowRight, Search, Filter } from 'lucide-react'
import Link from 'next/link'

const templates = [
  {
    id: 'saas-starter',
    name: 'SaaS Starter',
    description: 'Complete SaaS foundation with auth, payments, and dashboard',
    category: 'Foundation',
    difficulty: 'Beginner',
    image: '/templates/saas-starter.png',
    features: ['Authentication', 'Stripe Payments', 'User Dashboard', 'Admin Panel'],
    tags: ['nextjs', 'typescript', 'tailwind', 'prisma']
  },
  {
    id: 'crm-template',
    name: 'CRM System',
    description: 'Customer relationship management with contacts and deals',
    category: 'Business',
    difficulty: 'Intermediate',
    image: '/templates/crm.png',
    features: ['Contact Management', 'Deal Tracking', 'Analytics', 'Team Collaboration'],
    tags: ['react', 'nodejs', 'postgresql', 'charts']
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Task management and project tracking for teams',
    category: 'Productivity',
    difficulty: 'Intermediate',
    image: '/templates/project-manager.png',
    features: ['Kanban Board', 'Time Tracking', 'Team Management', 'Reports'],
    tags: ['kanban', 'team', 'analytics', 'dashboard']
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Online marketplace with products and orders',
    category: 'E-commerce',
    difficulty: 'Advanced',
    image: '/templates/ecommerce.png',
    features: ['Product Catalog', 'Shopping Cart', 'Order Management', 'Payment Gateway'],
    tags: ['stripe', 'inventory', 'products', 'payments']
  },
  {
    id: 'learning-platform',
    name: 'Learning Platform',
    description: 'Online course platform with video and quizzes',
    category: 'Education',
    difficulty: 'Intermediate',
    image: '/templates/learning.png',
    features: ['Course Management', 'Video Hosting', 'Quiz System', 'Certificates'],
    tags: ['education', 'video', 'quizzes', 'certificates']
  },
  {
    id: 'social-network',
    name: 'Social Network',
    description: 'Community platform with posts and interactions',
    category: 'Social',
    difficulty: 'Advanced',
    image: '/templates/social.png',
    features: ['User Profiles', 'Feed System', 'Messaging', 'Notifications'],
    tags: ['social', 'messaging', 'feed', 'notifications']
  },
  {
    id: 'blog-platform',
    name: 'Blog Platform',
    description: 'Content management system for bloggers and publications',
    category: 'Content',
    difficulty: 'Beginner',
    image: '/templates/blog.png',
    features: ['Rich Editor', 'SEO Optimization', 'Comments', 'Analytics'],
    tags: ['cms', 'blogging', 'seo', 'content']
  },
  {
    id: 'job-board',
    name: 'Job Board',
    description: 'Platform for posting and finding jobs',
    category: 'Business',
    difficulty: 'Intermediate',
    image: '/templates/jobs.png',
    features: ['Job Listings', 'Applications', 'Resume Upload', 'Company Profiles'],
    tags: ['jobs', 'careers', 'recruiting', 'applications']
  }
]

const categories = ['All', 'Foundation', 'Business', 'Productivity', 'E-commerce', 'Education', 'Social', 'Content']
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

const difficultyColors = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800'
}

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'All' || template.difficulty === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Template Library</h1>
          <p className="text-muted-foreground">
            Choose from our collection of production-ready templates to kickstart your SaaS project.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTemplates.length} of {templates.length} templates
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                        {feature}
                      </div>
                    ))}
                    {template.features.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{template.features.length - 3} more features
                      </div>
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

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('')
              setSelectedCategory('All')
              setSelectedDifficulty('All')
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
