#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { validateNpmPackageName } from 'validate-npm-package-name';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectConfig {
  name: string;
  type: 'saas' | 'internal' | 'minimal' | 'ecommerce';
  features: string[];
  database: 'postgresql' | 'mysql' | 'sqlite';
  auth: 'full' | 'simple' | 'none';
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  testing: 'jest' | 'vitest' | 'none';
  deployment: 'vercel' | 'netlify' | 'docker' | 'none';
}

const program = new Command();

program
  .name('create-auth-spine-app')
  .description('Create a new Auth-Spine application')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .option('-t, --type <type>', 'Project type (saas, internal, minimal, ecommerce)')
  .option('-f, --features <features>', 'Comma-separated list of features')
  .option('-d, --database <database>', 'Database type (postgresql, mysql, sqlite)')
  .option('-a, --auth <auth>', 'Authentication type (full, simple, none)')
  .option('-s, --styling <styling>', 'Styling solution (tailwind, css-modules, styled-components)')
  .option('--skip-install', 'Skip installing dependencies')
  .action(async (projectName, options) => {
    try {
      await createProject(projectName, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function createProject(projectName?: string, options: any = {}) {
  console.log(chalk.blue.bold('🚀 Welcome to Auth-Spine App Creator'));
  console.log(chalk.gray('Create a production-ready SaaS application in minutes\n'));

  // Get project configuration
  const config = await getProjectConfig(projectName, options);
  
  // Validate project name
  const validation = validateNpmPackageName(config.name);
  if (!validation.validForNewPackages) {
    throw new Error(`Invalid project name: ${config.name}`);
  }

  const projectPath = path.resolve(process.cwd(), config.name);
  
  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory ${config.name} already exists`);
  }

  console.log(chalk.blue(`\n📁 Creating project: ${config.name}`));
  console.log(chalk.gray(`Location: ${projectPath}\n`));

  // Create project directory
  const spinner = ora('Creating project structure...').start();
  
  try {
    await fs.ensureDir(projectPath);
    
    // Copy template files
    await copyTemplate(config.type, projectPath, config);
    
    spinner.succeed('Project structure created');
  } catch (error) {
    spinner.fail('Failed to create project structure');
    throw error;
  }

  // Update package.json
  spinner.start('Configuring project...');
  
  try {
    await updatePackageJson(projectPath, config);
    await createEnvFile(projectPath, config);
    await updateReadme(projectPath, config);
    
    spinner.succeed('Project configured');
  } catch (error) {
    spinner.fail('Failed to configure project');
    throw error;
  }

  // Install dependencies
  if (!options.skipInstall) {
    spinner.start('Installing dependencies...');
    
    try {
      await installDependencies(projectPath);
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      console.log(chalk.yellow('\n⚠️  Dependencies installation failed. Run "npm install" manually.'));
    }
  }

  // Setup database
  if (config.database !== 'sqlite') {
    spinner.start('Setting up database...');
    
    try {
      await setupDatabase(projectPath, config);
      spinner.succeed('Database configured');
    } catch (error) {
      spinner.fail('Failed to setup database');
      console.log(chalk.yellow('\n⚠️  Database setup failed. Please configure manually.'));
    }
  }

  // Success message
  console.log(chalk.green.bold('\n✅ Project created successfully!'));
  console.log(chalk.blue('\n🎯 Next steps:'));
  console.log(`  1. cd ${config.name}`);
  
  if (options.skipInstall) {
    console.log('  2. npm install');
  }
  
  console.log('  3. cp .env.example .env');
  console.log('  4. Configure your environment variables');
  console.log('  5. npm run db:setup');
  console.log('  6. npm run dev');
  
  console.log(chalk.blue('\n📚 Useful commands:'));
  console.log('  npm run dev          - Start development server');
  console.log('  npm run build        - Build for production');
  console.log('  npm run test         - Run tests');
  console.log('  npm run lint         - Run linting');
  console.log('  npm run db:studio    - Open database studio');
  console.log('  npm run security:audit - Run security audit');
  
  console.log(chalk.green('\n🎉 Happy coding with Auth-Spine!'));
}

async function getProjectConfig(projectName?: string, options: any = {}): Promise<ProjectConfig> {
  const config: Partial<ProjectConfig> = {};

  // Project name
  if (!projectName) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: 'my-auth-spine-app',
        validate: (input: string) => {
          const validation = validateNpmPackageName(input);
          if (!validation.validForNewPackages) {
            return 'Invalid project name';
          }
          return true;
        }
      }
    ]);
    config.name = name;
  } else {
    config.name = projectName;
  }

  // Project type
  if (!options.type) {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of application are you building?',
        choices: [
          {
            name: '🚀 SaaS Application (Full-featured with billing, teams, etc.)',
            value: 'saas'
          },
          {
            name: '🏢 Internal Tool (Admin dashboard, internal workflows)',
            value: 'internal'
          },
          {
            name: '🛒 E-commerce (Products, cart, payments)',
            value: 'ecommerce'
          },
          {
            name: '⚡ Minimal (Just auth and basic features)',
            value: 'minimal'
          }
        ]
      }
    ]);
    config.type = type;
  } else {
    config.type = options.type;
  }

  // Features based on type
  const featureChoices = getFeatureChoices(config.type!);
  
  if (!options.features && featureChoices.length > 0) {
    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select features to include:',
        choices: featureChoices
      }
    ]);
    config.features = features;
  } else {
    config.features = options.features ? options.features.split(',') : [];
  }

  // Database
  if (!options.database) {
    const { database } = await inquirer.prompt([
      {
        type: 'list',
        name: 'database',
        message: 'Choose your database:',
        choices: [
          {
            name: '🐘 PostgreSQL (Recommended for production)',
            value: 'postgresql'
          },
          {
            name: '🐬 MySQL (Traditional relational database)',
            value: 'mysql'
          },
          {
            name: '📁 SQLite (For development and simple apps)',
            value: 'sqlite'
          }
        ]
      }
    ]);
    config.database = database;
  } else {
    config.database = options.database;
  }

  // Authentication
  if (!options.auth) {
    const { auth } = await inquirer.prompt([
      {
        type: 'list',
        name: 'auth',
        message: 'Authentication setup:',
        choices: [
          {
            name: '🔐 Full Auth (Email, social, 2FA, roles)',
            value: 'full'
          },
          {
            name: '🔑 Simple Auth (Email/password only)',
            value: 'simple'
          },
          {
            name: '🚫 No Auth (Public application)',
            value: 'none'
          }
        ]
      }
    ]);
    config.auth = auth;
  } else {
    config.auth = options.auth;
  }

  // Styling
  if (!options.styling) {
    const { styling } = await inquirer.prompt([
      {
        type: 'list',
        name: 'styling',
        message: 'Choose styling solution:',
        choices: [
          {
            name: '🎨 Tailwind CSS (Utility-first CSS)',
            value: 'tailwind'
          },
          {
            name: '📦 CSS Modules (Scoped CSS)',
            value: 'css-modules'
          },
          {
            name: '💅 Styled Components (CSS-in-JS)',
            value: 'styled-components'
          }
        ]
      }
    ]);
    config.styling = styling;
  } else {
    config.styling = options.styling;
  }

  // Testing
  const { testing } = await inquirer.prompt([
    {
      type: 'list',
      name: 'testing',
      message: 'Testing framework:',
      choices: [
        {
          name: '🧪 Jest (Traditional testing)',
          value: 'jest'
        },
        {
          name: '⚡ Vitest (Fast modern testing)',
          value: 'vitest'
        },
        {
          name: '🚫 No testing',
          value: 'none'
        }
      ]
    }
  ]);
  config.testing = testing;

  return config as ProjectConfig;
}

function getFeatureChoices(type: string) {
  const allFeatures = [
    { name: '💳 Payments & Billing', value: 'payments' },
    { name: '👥 Teams & Multi-tenancy', value: 'teams' },
    { name: '📊 Analytics & Reporting', value: 'analytics' },
    { name: '📧 Email System', value: 'email' },
    { name: '🗂️ File Uploads', value: 'uploads' },
    { name: '🔔 Notifications', value: 'notifications' },
    { name: '📝 Blog/Content', value: 'blog' },
    { name: '💬 Chat/Messaging', value: 'chat' },
    { name: '📅 Calendar/Scheduling', value: 'calendar' },
    { name: '🛒 Shopping Cart', value: 'cart' },
    { name: '📦 Inventory Management', value: 'inventory' },
    { name: '📈 Dashboard & Charts', value: 'dashboard' }
  ];

  switch (type) {
    case 'saas':
      return allFeatures.filter(f => 
        ['payments', 'teams', 'analytics', 'email', 'uploads', 'notifications', 'dashboard'].includes(f.value)
      );
    case 'internal':
      return allFeatures.filter(f => 
        ['analytics', 'email', 'uploads', 'notifications', 'dashboard'].includes(f.value)
      );
    case 'ecommerce':
      return allFeatures.filter(f => 
        ['payments', 'email', 'uploads', 'notifications', 'cart', 'inventory'].includes(f.value)
      );
    case 'minimal':
      return [];
    default:
      return allFeatures;
  }
}

async function copyTemplate(type: string, projectPath: string, config: ProjectConfig) {
  const templatePath = path.join(__dirname, '../templates', type);
  
  if (!await fs.pathExists(templatePath)) {
    // Fallback to minimal template
    const fallbackPath = path.join(__dirname, '../templates/minimal');
    await fs.copy(fallbackPath, projectPath);
  } else {
    await fs.copy(templatePath, projectPath);
  }
}

async function updatePackageJson(projectPath: string, config: ProjectConfig) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  
  packageJson.name = config.name;
  packageJson.version = '0.1.0';
  packageJson.description = `${config.name} - Built with Auth-Spine`;
  
  // Add dependencies based on configuration
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  // Database dependencies
  if (config.database === 'postgresql') {
    dependencies['@prisma/client'] = '^5.0.0';
    dependencies['pg'] = '^8.11.0';
  } else if (config.database === 'mysql') {
    dependencies['@prisma/client'] = '^5.0.0';
    dependencies['mysql2'] = '^3.6.0';
  } else if (config.database === 'sqlite') {
    dependencies['@prisma/client'] = '^5.0.0';
    dependencies['better-sqlite3'] = '^9.0.0';
  }
  
  // Auth dependencies
  if (config.auth !== 'none') {
    dependencies['bcryptjs'] = '^2.4.3';
    dependencies['jsonwebtoken'] = '^9.0.2';
    dependencies['zod'] = '^3.22.0';
  }
  
  // Styling dependencies
  if (config.styling === 'tailwind') {
    dependencies['tailwindcss'] = '^3.3.0';
    dependencies['autoprefixer'] = '^10.4.16';
    dependencies['postcss'] = '^8.4.32';
  } else if (config.styling === 'styled-components') {
    dependencies['styled-components'] = '^6.1.0';
  }
  
  // Testing dependencies
  if (config.testing === 'jest') {
    devDependencies['jest'] = '^29.7.0';
    devDependencies['@testing-library/react'] = '^14.1.0';
    devDependencies['@testing-library/jest-dom'] = '^6.1.0';
  } else if (config.testing === 'vitest') {
    devDependencies['vitest'] = '^1.0.0';
    devDependencies['@testing-library/react'] = '^14.1.0';
    devDependencies['@testing-library/jest-dom'] = '^6.1.0';
  }
  
  // Feature dependencies
  if (config.features.includes('payments')) {
    dependencies['stripe'] = '^14.9.0';
  }
  
  if (config.features.includes('email')) {
    dependencies['nodemailer'] = '^6.9.0';
  }
  
  if (config.features.includes('uploads')) {
    dependencies['@aws-sdk/client-s3'] = '^3.454.0';
    dependencies['multer'] = '^1.4.5-lts.1';
  }
  
  if (config.features.includes('analytics')) {
    dependencies['mixpanel'] = '^0.18.0';
  }
  
  packageJson.dependencies = dependencies;
  packageJson.devDependencies = devDependencies;
  
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

async function createEnvFile(projectPath: string, config: ProjectConfig) {
  const envExamplePath = path.join(projectPath, '.env.example');
  const envContent = generateEnvContent(config);
  await fs.writeFile(envExamplePath, envContent);
}

function generateEnvContent(config: ProjectConfig): string {
  let content = '# Auth-Spine Environment Variables\n\n';
  
  content += '# Core\n';
  content += 'NODE_ENV=development\n';
  content += 'PORT=3000\n\n';
  
  content += '# Database\n';
  if (config.database === 'postgresql') {
    content += 'DATABASE_URL="postgresql://username:password@localhost:5432/authspine"\n';
  } else if (config.database === 'mysql') {
    content += 'DATABASE_URL="mysql://username:password@localhost:3306/authspine"\n';
  } else {
    content += 'DATABASE_URL="file:./dev.db"\n';
  }
  content += '\n';
  
  if (config.auth !== 'none') {
    content += '# Authentication\n';
    content += 'JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters\n';
    content += 'JWT_EXPIRES_IN=24h\n';
    content += 'BCRYPT_ROUNDS=12\n\n';
  }
  
  content += '# CORS\n';
  content += 'CORS_ORIGINS=http://localhost:3000\n\n';
  
  content += '# Logging\n';
  content += 'LOG_LEVEL=info\n';
  content += 'LOG_FORMAT=pretty\n\n';
  
  if (config.features.includes('email')) {
    content += '# Email\n';
    content += 'SMTP_HOST=smtp.gmail.com\n';
    content += 'SMTP_PORT=587\n';
    content += 'SMTP_USER=your-email@gmail.com\n';
    content += 'SMTP_PASS=your-app-password\n\n';
  }
  
  if (config.features.includes('payments')) {
    content += '# Payments\n';
    content += 'STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key\n';
    content += 'STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key\n\n';
  }
  
  if (config.features.includes('uploads')) {
    content += '# File Uploads\n';
    content += 'AWS_ACCESS_KEY_ID=your-aws-access-key\n';
    content += 'AWS_SECRET_ACCESS_KEY=your-aws-secret-key\n';
    content += 'AWS_REGION=us-east-1\n';
    content += 'AWS_S3_BUCKET=your-s3-bucket\n\n';
  }
  
  if (config.features.includes('analytics')) {
    content += '# Analytics\n';
    content += 'MIXPANEL_TOKEN=your-mixpanel-token\n\n';
  }
  
  content += '# Feature Flags\n';
  content += 'ENABLE_ANALYTICS=false\n';
  content += 'ENABLE_CACHE=true\n';
  content += 'ENABLE_RATE_LIMITING=true\n\n';
  
  content += '# Security\n';
  content += 'SESSION_MAX_AGE=86400000\n';
  content += 'MAX_FILE_SIZE=10485760\n';
  content += 'ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf\n';
  
  return content;
}

async function updateReadme(projectPath: string, config: ProjectConfig) {
  const readmePath = path.join(projectPath, 'README.md');
  const readmeContent = generateReadmeContent(config);
  await fs.writeFile(readmePath, readmeContent);
}

function generateReadmeContent(config: ProjectConfig): string {
  return `# ${config.name}

Built with [Auth-Spine](https://github.com/auth-spine/auth-spine) - The enterprise-grade authentication and SaaS framework.

## 🚀 Features

${config.features.length > 0 ? config.features.map(f => `- ${f}`).join('\n') : '- Basic authentication and authorization'}

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: ${config.database}
- **Authentication**: ${config.auth}
- **Styling**: ${config.styling}
- **Testing**: ${config.testing}

## 📋 Prerequisites

- Node.js 18+
- ${config.database === 'postgresql' ? 'PostgreSQL' : config.database === 'mysql' ? 'MySQL' : 'No database required'}

## 🚀 Getting Started

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Set up the database**
   \`\`\`bash
   npm run db:setup
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📚 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linting
- \`npm run db:studio\` - Open database studio
- \`npm run security:audit\` - Run security audit

## 🔧 Configuration

See \`.env.example\` for all available configuration options.

## 📚 Documentation

- [Auth-Spine Documentation](https://docs.auth-spine.com)
- [API Reference](https://api.auth-spine.com)
- [Examples](https://github.com/auth-spine/examples)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
`;
}

async function installDependencies(projectPath: string) {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install'], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    
    npm.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
    
    npm.on('error', reject);
  });
}

async function setupDatabase(projectPath: string, config: ProjectConfig) {
  // This would typically run prisma generate and initial migration
  // For now, we'll just create the database directory structure
  const prismaDir = path.join(projectPath, 'prisma');
  await fs.ensureDir(prismaDir);
}

// Run the CLI
program.parse();
