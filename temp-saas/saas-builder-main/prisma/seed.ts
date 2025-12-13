import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create templates
  const templates = [
    {
      id: 'ecommerce-template',
      name: 'E-commerce Store',
      description: 'Complete online store with product catalog, cart, and payment processing',
      category: 'E-commerce',
      difficulty: 'Intermediate',
      image: '/templates/ecommerce.jpg',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'Order Management'],
      techStack: ['Next.js', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
      previewUrl: '/templates/ecommerce/preview',
      githubUrl: 'https://github.com/saas-builder/ecommerce-template',
    },
    {
      id: 'saas-template',
      name: 'SaaS Landing Page',
      description: 'Modern SaaS landing page with pricing, features, and sign-up forms',
      category: 'SaaS',
      difficulty: 'Beginner',
      image: '/templates/saas.jpg',
      features: ['Landing Page', 'Pricing Tables', 'Feature Showcase', 'Testimonials'],
      techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
      previewUrl: '/templates/saas/preview',
      githubUrl: 'https://github.com/saas-builder/saas-template',
    },
    {
      id: 'blog-template',
      name: 'Blog Platform',
      description: 'Full-featured blog with markdown support, comments, and subscriptions',
      category: 'Content',
      difficulty: 'Beginner',
      image: '/templates/blog.jpg',
      features: ['Markdown Editor', 'Comments', 'Categories', 'RSS Feed'],
      techStack: ['Next.js', 'MDX', 'PostgreSQL', 'Tailwind CSS'],
      previewUrl: '/templates/blog/preview',
      githubUrl: 'https://github.com/saas-builder/blog-template',
    },
    {
      id: 'crm-template',
      name: 'CRM System',
      description: 'Customer relationship management with contacts, deals, and analytics',
      category: 'Business',
      difficulty: 'Advanced',
      image: '/templates/crm.jpg',
      features: ['Contact Management', 'Deal Pipeline', 'Analytics Dashboard', 'Email Integration'],
      techStack: ['Next.js', 'PostgreSQL', 'Chart.js', 'Tailwind CSS'],
      previewUrl: '/templates/crm/preview',
      githubUrl: 'https://github.com/saas-builder/crm-template',
    },
    {
      id: 'education-template',
      name: 'Learning Platform',
      description: 'Online education platform with courses, lessons, and progress tracking',
      category: 'Education',
      difficulty: 'Intermediate',
      image: '/templates/education.jpg',
      features: ['Course Management', 'Video Lessons', 'Progress Tracking', 'Certificates'],
      techStack: ['Next.js', 'PostgreSQL', 'AWS S3', 'Tailwind CSS'],
      previewUrl: '/templates/education/preview',
      githubUrl: 'https://github.com/saas-builder/education-template',
    },
    {
      id: 'social-template',
      name: 'Social Network',
      description: 'Social networking platform with profiles, posts, and real-time updates',
      category: 'Social',
      difficulty: 'Advanced',
      image: '/templates/social.jpg',
      features: ['User Profiles', 'Social Feed', 'Real-time Updates', 'Direct Messaging'],
      techStack: ['Next.js', 'PostgreSQL', 'Socket.io', 'Tailwind CSS'],
      previewUrl: '/templates/social/preview',
      githubUrl: 'https://github.com/saas-builder/social-template',
    },
    {
      id: 'portfolio-template',
      name: 'Portfolio Website',
      description: 'Professional portfolio with projects, skills, and contact forms',
      category: 'Portfolio',
      difficulty: 'Beginner',
      image: '/templates/portfolio.jpg',
      features: ['Project Gallery', 'Skills Section', 'Contact Form', 'Blog Integration'],
      techStack: ['Next.js', 'Tailwind CSS', 'Email.js', 'Framer Motion'],
      previewUrl: '/templates/portfolio/preview',
      githubUrl: 'https://github.com/saas-builder/portfolio-template',
    },
    {
      id: 'booking-template',
      name: 'Booking System',
      description: 'Appointment booking system with calendar integration and notifications',
      category: 'Business',
      difficulty: 'Intermediate',
      image: '/templates/booking.jpg',
      features: ['Calendar Integration', 'Booking Management', 'Email Notifications', 'Payment Processing'],
      techStack: ['Next.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
      previewUrl: '/templates/booking/preview',
      githubUrl: 'https://github.com/saas-builder/booking-template',
    },
    {
      id: 'forum-template',
      name: 'Community Forum',
      description: 'Discussion forum with categories, threads, and user moderation',
      category: 'Community',
      difficulty: 'Intermediate',
      image: '/templates/forum.jpg',
      features: ['Discussion Threads', 'Categories', 'User Moderation', 'Rich Text Editor'],
      techStack: ['Next.js', 'PostgreSQL', 'Tailwind CSS', 'TipTap'],
      previewUrl: '/templates/forum/preview',
      githubUrl: 'https://github.com/saas-builder/forum-template',
    },
    {
      id: 'job-board-template',
      name: 'Job Board',
      description: 'Job listing platform with applications, resumes, and employer profiles',
      category: 'Business',
      difficulty: 'Intermediate',
      image: '/templates/job-board.jpg',
      features: ['Job Listings', 'Application System', 'Resume Upload', 'Employer Profiles'],
      techStack: ['Next.js', 'PostgreSQL', 'AWS S3', 'Tailwind CSS'],
      previewUrl: '/templates/job-board/preview',
      githubUrl: 'https://github.com/saas-builder/job-board-template',
    },
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    })
  }

  console.log('🌱 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
