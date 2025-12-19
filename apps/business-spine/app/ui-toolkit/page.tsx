'use client'
import React, { useMemo, useState } from 'react'
import { Search, AlertCircle, CheckCircle, Copy, ChevronDown, ChevronRight } from 'lucide-react'

type Item = { id: string; problem: string; solutions: string[]; code: string }
type Data = Record<string, Item[]>

const troubleshootData: Data = {
  'Layout Issues': [
    {
      id: 'layout-1',
      problem: 'Element not visible or cut off',
      solutions: [
        'Check if parent has overflow: hidden',
        'Verify z-index stacking',
        'Check display: none / visibility: hidden',
        'Inspect parent height/width constraints',
      ],
      code: `.parent { overflow: visible; }
.element { position: relative; z-index: 999; }`,
    },
    {
      id: 'layout-2',
      problem: 'Flexbox not working as expected',
      solutions: [
        'Ensure parent has display: flex',
        'Check flex-direction (row vs column)',
        'Use flex-wrap: wrap if items should wrap',
        'Adjust justify-content and align-items',
      ],
      code: `.container{display:flex;flex-direction:row;justify-content:center;align-items:center;gap:1rem;}`,
    },
    {
      id: 'layout-3',
      problem: 'Grid layout not responsive',
      solutions: [
        'Use grid-template-columns with repeat()',
        'Add minmax() for responsive grid items',
        'Use auto-fit vs auto-fill appropriately',
        'Check grid gaps and container width',
      ],
      code: `.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;}`,
    },
  ],
  'Responsiveness': [
    {
      id: 'responsive-1',
      problem: 'Mobile layout broken',
      solutions: [
        'Add viewport meta tag',
        'Use mobile-first breakpoints',
        'Test common widths: 320, 768, 1024, 1440',
        'Use relative units instead of fixed pixels',
      ],
      code: `.container{width:100%;padding:1rem;}
@media(min-width:768px){.container{width:750px;margin:0 auto;}}`,
    },
    {
      id: 'responsive-2',
      problem: 'Images not responsive',
      solutions: [
        'Add max-width: 100% to images',
        'Use srcset for different screen sizes',
        'Consider picture element for art direction',
        'Add loading="lazy" for performance',
      ],
      code: `img{max-width:100%;height:auto;}
<img src="small.jpg" srcset="small.jpg 320w, medium.jpg 768w, large.jpg 1024w">`,
    },
  ],
  'Styling & CSS': [
    {
      id: 'style-1',
      problem: 'Tailwind classes not working',
      solutions: [
        'Check if tailwind.config.js includes correct paths',
        'Verify PostCSS configuration',
        'Ensure @tailwind directives in CSS',
        'Restart development server after config changes',
      ],
      code: `/* tailwind.config.js */
content: ["./src/**/*.{js,ts,jsx,tsx}"],
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    {
      id: 'style-2',
      problem: 'CSS specificity issues',
      solutions: [
        'Use !important sparingly',
        'Check order of CSS imports',
        'Use more specific selectors',
        'Consider CSS-in-JS for component isolation',
      ],
      code: `.component .specific-class { color: blue !important; }
/* or use CSS-in-JS */
const StyledComponent = styled.div\`color: blue;\`;`,
    },
  ],
  'Performance': [
    {
      id: 'perf-1',
      problem: 'Slow page load times',
      solutions: [
        'Optimize images and assets',
        'Use code splitting and lazy loading',
        'Minimize and compress assets',
        'Use CDN for static resources',
      ],
      code: `// Next.js Image optimization
import Image from 'next/image'
<Image src="/photo.jpg" alt="Photo" width={500} height={300} />
// Dynamic imports
const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false })`,
    },
    {
      id: 'perf-2',
      problem: 'Excessive re-renders',
      solutions: [
        'Use React.memo for component memoization',
        'Wrap functions in useCallback',
        'Use useMemo for expensive calculations',
        'Check dependency arrays in hooks',
      ],
      code: `const MemoizedComponent = React.memo(({ data }) => {
  const expensiveValue = useMemo(() => processData(data), [data])
  const handleClick = useCallback(() => { /* ... */ }, [])
  return <div>{expensiveValue}</div>
})`,
    },
  ],
  'Authentication': [
    {
      id: 'auth-1',
      problem: 'JWT token not working',
      solutions: [
        'Check JWT_SECRET in environment variables',
        'Verify token format and expiration',
        'Check token storage (cookies vs localStorage)',
        'Ensure proper CORS configuration',
      ],
      code: `// Verify token setup
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' })
// Store in httpOnly cookie
res.cookie('token', token, { httpOnly: true, secure: true })`,
    },
    {
      id: 'auth-2',
      problem: 'Protected routes not redirecting',
      solutions: [
        'Check middleware configuration',
        'Verify authentication logic',
        'Ensure proper redirect URLs',
        'Check Next.js app directory structure',
      ],
      code: `// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}`,
    },
  ],
}

export default function UIToolkitPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    if (!searchTerm) return troubleshootData
    
    const term = searchTerm.toLowerCase()
    const result: Data = {}
    
    Object.entries(troubleshootData).forEach(([category, items]) => {
      const filteredItems = items.filter(item =>
        item.problem.toLowerCase().includes(term) ||
        item.solutions.some(sol => sol.toLowerCase().includes(term)) ||
        item.code.toLowerCase().includes(term)
      )
      
      if (filteredItems.length > 0) {
        result[category] = filteredItems
      }
    })
    
    return result
  }, [searchTerm])

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const totalIssues = Object.values(troubleshootData).flat().length
  const filteredIssues = Object.values(filteredData).flat().length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            UI Troubleshooting Toolkit
          </h1>
          <p className="text-gray-600 mb-6">
            Common UI issues and their solutions. Click on categories to expand and see detailed troubleshooting steps.
          </p>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search issues, solutions, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredIssues} of {totalIssues} issues
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {Object.entries(filteredData).map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {items.length}
                  </span>
                </div>
              </button>
              
              {expandedCategories.has(category) && (
                <div className="border-t border-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start space-x-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <h3 className="font-medium text-gray-900">{item.problem}</h3>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Solutions:</h4>
                        <ul className="space-y-1">
                          {item.solutions.map((solution, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Code Example:</h4>
                          <button
                            onClick={() => copyToClipboard(item.code, item.id)}
                            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                          >
                            {copiedId === item.id ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                          <code>{item.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredIssues === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or browse all categories above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
