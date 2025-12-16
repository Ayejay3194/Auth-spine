/**
 * Professional Prettier Configuration for Auth-spine Enterprise
 * Optimized for consistent code formatting
 */

module.exports = {
  // Print width - line length that Prettier will try to maintain
  printWidth: 100,
  
  // Tab width - number of spaces per indentation level
  tabWidth: 2,
  
  // Use tabs instead of spaces
  useTabs: false,
  
  // Semicolons at the end of statements
  semi: true,
  
  // Use single quotes instead of double quotes
  singleQuote: true,
  
  // Quote style for object properties
  quoteProps: 'as-needed',
  
  // Use trailing commas where valid in ES5 (objects, arrays, etc.)
  trailingComma: 'es5',
  
  // Spaces between brackets in object literals
  bracketSpacing: true,
  
  // Put the > of a multi-line JSX element at the end of the last line
  bracketSameLine: false,
  
  // Include parentheses around a sole arrow function parameter
  arrowParens: 'avoid',
  
  // Format only files that have a pragma comment
  requirePragma: false,
  
  // Insert pragma comment at the top of formatted files
  insertPragma: false,
  
  // How to handle whitespace in prose
  proseWrap: 'preserve',
  
  // How to handle whitespace in HTML
  htmlWhitespaceSensitivity: 'css',
  
  // Line ending style
  endOfLine: 'lf',
  
  // Control whether Prettier formats quoted code embedded in the file
  embeddedLanguageFormatting: 'auto',
  
  // Enforce single attribute per line in HTML, Vue and JSX
  singleAttributePerLine: false,
  
  // Plugin configurations
  plugins: [
    'prettier-plugin-tailwindcss',
  ],
  
  // Tailwind CSS specific configuration
  tailwindConfig: './tailwind.config.js',
  
  // Override configurations for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
