'use client';

import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Copy, ChevronDown, ChevronRight } from 'lucide-react';

const UITroubleshootKit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const troubleshootData = {
    'Layout Issues': [
      {
        id: 'layout-1',
        problem: 'Element not visible or cut off',
        solutions: [
          'Check if parent has overflow: hidden - add overflow: visible or overflow: auto',
          'Verify z-index stacking - increase z-index value',
          'Check if element has display: none or visibility: hidden',
          'Inspect parent height/width constraints - may need min-height or height: auto'
        ],
        code: `/* Fix overflow issues */
.parent {
  overflow: visible; /* or auto */
}

/* Fix z-index */
.element {
  position: relative;
  z-index: 999;
}`
      },
      {
        id: 'layout-2',
        problem: 'Flexbox not working as expected',
        solutions: [
          'Ensure parent has display: flex or display: inline-flex',
          'Check flex-direction (row vs column)',
          'Use flex-wrap: wrap if items should wrap',
          'Adjust justify-content and align-items for positioning'
        ],
        code: `/* Common flexbox setup */
.container {
  display: flex;
  flex-direction: row; /* or column */
  justify-content: center;
  align-items: center;
  gap: 1rem;
}`
      },
      {
        id: 'layout-3',
        problem: 'Grid layout not displaying correctly',
        solutions: [
          'Verify display: grid on container',
          'Check grid-template-columns and grid-template-rows',
          'Use grid-auto-flow if items aren\'t flowing correctly',
          'Inspect gap property for spacing'
        ],
        code: `/* Basic grid setup */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}`
      },
      {
        id: 'layout-4',
        problem: 'Element not centering',
        solutions: [
          'For flexbox: use justify-content and align-items center',
          'For grid: use place-items: center',
          'For absolute positioning: use top: 50%, left: 50%, transform: translate(-50%, -50%)',
          'For text: use text-align: center'
        ],
        code: `/* Flexbox centering */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Absolute centering */
.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}`
      }
    ],
    'Spacing & Sizing': [
      {
        id: 'spacing-1',
        problem: 'Unexpected margins or padding',
        solutions: [
          'Check browser default styles - add CSS reset or normalize.css',
          'Inspect computed styles in DevTools',
          'Look for inherited margin/padding from parent',
          'Use * { margin: 0; padding: 0; } as nuclear option'
        ],
        code: `/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`
      },
      {
        id: 'spacing-2',
        problem: 'Box model issues (width not what you expect)',
        solutions: [
          'Add box-sizing: border-box to include padding in width',
          'Check if borders are adding to total width',
          'Verify parent container width constraints',
          'Use calc() for precise calculations: width: calc(100% - 2rem)'
        ],
        code: `/* Include padding in width */
* {
  box-sizing: border-box;
}

/* Precise width calculation */
.element {
  width: calc(100% - 40px);
}`
      },
      {
        id: 'spacing-3',
        problem: 'Responsive sizing not working',
        solutions: [
          'Use relative units (%, em, rem, vw, vh) instead of px',
          'Add media queries for breakpoints',
          'Use min-width, max-width instead of fixed width',
          'Check viewport meta tag: <meta name="viewport" content="width=device-width">'
        ],
        code: `/* Responsive sizing */
.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    width: 95%;
  }
}`
      }
    ],
    'Text & Font Issues': [
      {
        id: 'text-1',
        problem: 'Text overflowing container',
        solutions: [
          'Add word-wrap: break-word or overflow-wrap: break-word',
          'Use text-overflow: ellipsis with overflow: hidden',
          'Set max-width or width constraint on text container',
          'Use white-space: normal (not nowrap)'
        ],
        code: `/* Text overflow with ellipsis */
.text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Break long words */
.break-word {
  word-wrap: break-word;
  overflow-wrap: break-word;
}`
      },
      {
        id: 'text-2',
        problem: 'Font not loading or displaying',
        solutions: [
          'Check @font-face path is correct',
          'Verify font file format (woff2, woff, ttf)',
          'Add font-display: swap to prevent invisible text',
          'Check if font-family name matches exactly'
        ],
        code: `/* Font face declaration */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}

.element {
  font-family: 'CustomFont', sans-serif;
}`
      },
      {
        id: 'text-3',
        problem: 'Text alignment issues',
        solutions: [
          'Use text-align: center/left/right for inline content',
          'For vertical centering, use flexbox or grid on parent',
          'Check line-height if text appears off-center vertically',
          'Use vertical-align for inline/inline-block elements'
        ],
        code: `/* Vertical and horizontal centering */
.center-text {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}`
      }
    ],
    'Color & Styling': [
      {
        id: 'color-1',
        problem: 'Colors not displaying correctly',
        solutions: [
          'Check CSS specificity - more specific selectors override',
          'Verify color format is valid (hex, rgb, rgba, hsl)',
          'Look for !important overrides',
          'Check if opacity or filter is affecting color'
        ],
        code: `/* Specificity example */
.button { color: blue; } /* Specificity: 10 */
#header .button { color: red; } /* Specificity: 110 - wins */

/* Using !important (use sparingly) */
.button { color: green !important; }`
      },
      {
        id: 'color-2',
        problem: 'Hover/active states not working',
        solutions: [
          'Ensure :hover comes after base styles in CSS',
          'Check if pointer-events: none is blocking interactions',
          'Verify element is not covered by another element',
          'Add transition for smooth state changes'
        ],
        code: `/* Proper hover state */
.button {
  background: blue;
  transition: all 0.3s ease;
}

.button:hover {
  background: darkblue;
  cursor: pointer;
}`
      }
    ],
    'Positioning Issues': [
      {
        id: 'position-1',
        problem: 'Absolute positioning not working',
        solutions: [
          'Parent must have position: relative, absolute, or fixed',
          'Check z-index if element is hidden behind others',
          'Verify top/right/bottom/left values are set',
          'Make sure parent has defined dimensions'
        ],
        code: `/* Correct absolute positioning */
.parent {
  position: relative;
}

.child {
  position: absolute;
  top: 10px;
  right: 10px;
}`
      },
      {
        id: 'position-2',
        problem: 'Fixed element scrolling with page',
        solutions: [
          'Ensure position: fixed (not absolute)',
          'Check if parent has transform, filter, or perspective property',
          'Verify overflow properties on ancestors',
          'Use position: sticky for scroll-aware positioning'
        ],
        code: `/* Fixed positioning */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

/* Sticky positioning */
.sticky-nav {
  position: sticky;
  top: 0;
}`
      }
    ],
    'Images & Media': [
      {
        id: 'image-1',
        problem: 'Images not loading',
        solutions: [
          'Check image path is correct (relative vs absolute)',
          'Verify file exists and is accessible',
          'Check CORS policy if loading from external source',
          'Ensure correct file extension (.jpg, .png, .svg, .webp)'
        ],
        code: `/* Responsive image */
img {
  max-width: 100%;
  height: auto;
}

/* Background image */
.bg-image {
  background-image: url('/path/to/image.jpg');
  background-size: cover;
  background-position: center;
}`
      },
      {
        id: 'image-2',
        problem: 'Image aspect ratio distorted',
        solutions: [
          'Use object-fit: cover or contain',
          'Set only width or height, not both',
          'Use aspect-ratio property for modern browsers',
          'Wrap in container with padding-bottom percentage trick'
        ],
        code: `/* Maintain aspect ratio */
img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Modern aspect ratio */
.image-container {
  aspect-ratio: 16 / 9;
}`
      }
    ],
    'Responsiveness': [
      {
        id: 'responsive-1',
        problem: 'Mobile layout broken',
        solutions: [
          'Add viewport meta tag in HTML head',
          'Use mobile-first approach with min-width media queries',
          'Test at common breakpoints: 320px, 768px, 1024px, 1440px',
          'Use relative units instead of fixed pixels'
        ],
        code: `/* Mobile first approach */
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    width: 970px;
  }
}`
      },
      {
        id: 'responsive-2',
        problem: 'Elements overlapping on mobile',
        solutions: [
          'Reduce font sizes at smaller breakpoints',
          'Stack elements vertically with flex-direction: column',
          'Adjust margins and padding for mobile',
          'Hide non-essential elements on mobile'
        ],
        code: `/* Stack on mobile */
.flex-container {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;
  }
}

/* Hide on mobile */
@media (max-width: 767px) {
  .desktop-only {
    display: none;
  }
}`
      }
    ],
    'Performance': [
      {
        id: 'perf-1',
        problem: 'Animations janky or slow',
        solutions: [
          'Use transform and opacity for animations (GPU accelerated)',
          'Avoid animating width, height, top, left',
          'Add will-change property for complex animations',
          'Reduce animation complexity or duration'
        ],
        code: `/* Smooth animation */
.animated {
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform;
}

.animated:hover {
  transform: translateY(-5px);
}

/* Avoid animating these */
/* width, height, top, left, margin, padding */`
      }
    ]
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filterData = () => {
    if (!searchTerm) return troubleshootData;

    const filtered: Record<string, typeof troubleshootData[keyof typeof troubleshootData]> = {};
    Object.keys(troubleshootData).forEach(category => {
      const categoryData = troubleshootData[category as keyof typeof troubleshootData];
      const filteredItems = categoryData.filter(item =>
        item.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.solutions.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
      }
    });
    return filtered;
  };

  const filteredData = filterData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              UI Troubleshooting Toolkit
            </h1>
          </div>
          <p className="text-slate-600 mb-6">
            Quick solutions for the most common UI problems. Search for your issue or browse by category.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for your UI problem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-800"
            />
          </div>
        </div>

        <div className="space-y-4">
          {Object.keys(filteredData).length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-slate-600">No results found. Try a different search term.</p>
            </div>
          ) : (
            Object.entries(filteredData).map(([category, items]) => (
              <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                >
                  <h2 className="text-xl font-bold text-slate-800">{category}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full">
                      {items.length} {items.length === 1 ? 'issue' : 'issues'}
                    </span>
                    {expandedCategories[category] ? (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                </button>

                {expandedCategories[category] && (
                  <div className="p-6 space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="border-l-4 border-blue-500 pl-6 py-2">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          {item.problem}
                        </h3>

                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">Solutions:</p>
                          <ul className="space-y-2">
                            {item.solutions.map((solution, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{solution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-900 rounded-lg p-4 relative">
                          <button
                            onClick={() => copyCode(item.code, item.id)}
                            className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                            title="Copy code"
                          >
                            {copiedId === item.id ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                          <pre className="text-sm text-slate-100 overflow-x-auto">
                            <code>{item.code}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-3">Quick Debugging Tips:</h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use browser DevTools (F12) to inspect elements and see computed styles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Add temporary borders to visualize element boundaries: border: 1px solid red;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Check the Console tab for JavaScript errors that might affect rendering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Test in multiple browsers to rule out browser-specific issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Use CSS validators to catch syntax errors</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UITroubleshootKit;
