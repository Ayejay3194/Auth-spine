#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('🚀 Welcome to SaaS Builder Kit Setup!')
console.log('This script will help you set up your SaaS application in minutes.\n')

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function execCommand(command, description) {
  console.log(`\n📋 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log('✅ Done!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

function createEnvFile() {
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/saas_builder"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${require('crypto').randomBytes(32).toString('hex')}"

# OAuth Providers (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe (Optional - leave empty if not using)
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Email (Resend - Optional)
RESEND_API_KEY=""
FROM_EMAIL="noreply@yourdomain.com"

# App Settings
APP_NAME="My SaaS App"
APP_URL="http://localhost:3000"
SUPPORT_EMAIL="support@yourdomain.com"
`

  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envContent)
    console.log('✅ Created .env file with default values')
    console.log('⚠️  Please update the .env file with your actual credentials')
  } else {
    console.log('⚠️  .env file already exists')
  }
}

async function main() {
  try {
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      console.error('❌ package.json not found. Please run this script from the project root.')
      process.exit(1)
    }

    // Install dependencies
    execCommand('npm install', 'Installing dependencies')

    // Setup environment variables
    createEnvFile()

    // Ask about database setup
    const hasDatabase = await askQuestion('\n🗄️  Do you have PostgreSQL installed? (y/n): ')
    
    if (hasDatabase.toLowerCase() === 'y') {
      const dbUrl = await askQuestion('Enter your PostgreSQL database URL (or press Enter to use default): ')
      if (dbUrl) {
        // Update .env with provided database URL
        let envContent = fs.readFileSync('.env', 'utf8')
        envContent = envContent.replace(
          'DATABASE_URL="postgresql://username:password@localhost:5432/saas_builder"',
          `DATABASE_URL="${dbUrl}"`
        )
        fs.writeFileSync('.env', envContent)
      }

      // Setup database
      execCommand('npx prisma generate', 'Generating Prisma client')
      execCommand('npx prisma db push', 'Setting up database schema')
    } else {
      console.log('\n⚠️  Skipping database setup. Please install PostgreSQL and run:')
      console.log('   npx prisma generate')
      console.log('   npx prisma db push')
    }

    // Ask about OAuth providers
    console.log('\n🔐 OAuth Setup (Optional)')
    const setupOAuth = await askQuestion('Do you want to set up OAuth providers now? (y/n): ')
    
    if (setupOAuth.toLowerCase() === 'y') {
      console.log('\n📖 Setup Instructions:')
      console.log('1. Go to https://console.cloud.google.com/ for Google OAuth')
      console.log('2. Go to https://github.com/settings/applications/new for GitHub OAuth')
      console.log('3. Update the .env file with your client IDs and secrets')
    }

    // Ask about Stripe
    console.log('\n💳 Stripe Setup (Optional)')
    const setupStripe = await askQuestion('Do you want to set up Stripe payments? (y/n): ')
    
    if (setupStripe.toLowerCase() === 'y') {
      console.log('\n📖 Setup Instructions:')
      console.log('1. Go to https://dashboard.stripe.com/apikeys')
      console.log('2. Create test keys and update the .env file')
      console.log('3. Set up webhooks for your domain')
    }

    // Final setup
    console.log('\n🏁 Finalizing setup...')
    
    // Create necessary directories
    const directories = [
      'public/uploads',
      'public/avatars',
      'logs',
      'temp'
    ]
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`✅ Created directory: ${dir}`)
      }
    })

    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Update your .env file with actual credentials')
    console.log('2. Run: npm run dev')
    console.log('3. Open: http://localhost:3000')
    console.log('\n📚 Documentation: https://docs.saasbuilder.com')
    console.log('💬 Support: https://discord.gg/saasbuilder')
    console.log('\n🚀 Your SaaS is ready to build!')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
