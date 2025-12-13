'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Rocket, Users } from 'lucide-react'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-12 sm:p-16">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              <Rocket className="mr-2 h-4 w-4" />
              Limited Time: Get 50% off Professional Plan
            </div>
            
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Build Your Next SaaS?
            </h2>
            
            <p className="mb-10 text-lg text-white/90">
              Join thousands of developers who've already launched successful SaaS products 
              with our comprehensive kit. Start building today.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/templates">
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Users className="mr-2 h-4 w-4" />
                Schedule Demo
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm text-white/80">Developers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-white/80">SaaS Launched</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-sm text-white/80">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
