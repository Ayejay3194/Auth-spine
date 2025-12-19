import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/lib/logger';
import { config } from '../src/lib/config';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting database seeding...');

  // Create default roles
  await seedRoles();
  
  // Create default permissions
  await seedPermissions();
  
  // Create admin user
  await seedAdminUser();
  
  // Create sample data for development
  if (config.NODE_ENV === 'development') {
    await seedDevelopmentData();
  }

  logger.info('Database seeding completed successfully');
}

async function seedRoles() {
  logger.info('Seeding roles...');
  
  const roles = [
    { name: 'super_admin', description: 'Super administrator with full access' },
    { name: 'admin', description: 'Administrator with management access' },
    { name: 'manager', description: 'Manager with team access' },
    { name: 'employee', description: 'Regular employee' },
    { name: 'hr', description: 'Human resources personnel' },
    { name: 'finance', description: 'Finance department personnel' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  logger.info('Roles seeded successfully');
}

async function seedPermissions() {
  logger.info('Seeding permissions...');
  
  const permissions = [
    // User management
    { name: 'users:create', description: 'Create new users' },
    { name: 'users:read', description: 'View user information' },
    { name: 'users:update', description: 'Update user information' },
    { name: 'users:delete', description: 'Delete users' },
    
    // Role management
    { name: 'roles:create', description: 'Create new roles' },
    { name: 'roles:read', description: 'View role information' },
    { name: 'roles:update', description: 'Update role information' },
    { name: 'roles:delete', description: 'Delete roles' },
    
    // Payroll management
    { name: 'payroll:create', description: 'Create payroll runs' },
    { name: 'payroll:read', description: 'View payroll information' },
    { name: 'payroll:update', description: 'Update payroll information' },
    { name: 'payroll:approve', description: 'Approve payroll runs' },
    { name: 'payroll:delete', description: 'Delete payroll runs' },
    
    // Analytics
    { name: 'analytics:read', description: 'View analytics reports' },
    { name: 'analytics:export', description: 'Export analytics data' },
    
    // System management
    { name: 'system:config', description: 'Configure system settings' },
    { name: 'system:logs', description: 'View system logs' },
    { name: 'system:health', description: 'View system health' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission,
    });
  }

  logger.info('Permissions seeded successfully');
}

async function seedAdminUser() {
  logger.info('Seeding admin user...');
  
  const adminEmail = 'admin@authspine.com';
  const adminPassword = 'Admin123!'; // Change this in production
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, parseInt(config.BCRYPT_ROUNDS));
  
  // Create or update admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Administrator',
      password: hashedPassword,
      emailVerified: new Date(),
    },
    create: {
      email: adminEmail,
      name: 'System Administrator',
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  // Assign super_admin role
  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'super_admin' },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        assignedBy: adminUser.id,
        assignedAt: new Date(),
      },
    });
  }

  logger.info('Admin user seeded successfully');
}

async function seedDevelopmentData() {
  logger.info('Seeding development data...');
  
  // Create test users
  const testUsers = [
    { email: 'manager@test.com', name: 'Test Manager', role: 'manager' },
    { email: 'employee@test.com', name: 'Test Employee', role: 'employee' },
    { email: 'hr@test.com', name: 'Test HR', role: 'hr' },
    { email: 'finance@test.com', name: 'Test Finance', role: 'finance' },
  ];

  for (const testUser of testUsers) {
    const hashedPassword = await bcrypt.hash('Test123!', parseInt(config.BCRYPT_ROUNDS));
    
    const user = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {
        name: testUser.name,
        password: hashedPassword,
        emailVerified: new Date(),
      },
      create: {
        email: testUser.email,
        name: testUser.name,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    // Assign role
    const role = await prisma.role.findUnique({
      where: { name: testUser.role },
    });

    if (role) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
          assignedBy: user.id,
          assignedAt: new Date(),
        },
      });
    }
  }

  // Create sample pay groups
  const payGroups = [
    { name: 'Full-time Employees', cadence: 'BIWEEKLY' },
    { name: 'Part-time Employees', cadence: 'WEEKLY' },
    { name: 'Contractors', cadence: 'MONTHLY' },
  ];

  for (const payGroup of payGroups) {
    await prisma.payGroup.upsert({
      where: { name: payGroup.name },
      update: { cadence: payGroup.cadence as any },
      create: payGroup as any,
    });
  }

  // Create sample departments
  const departments = [
    { name: 'Engineering', description: 'Software development team' },
    { name: 'Sales', description: 'Sales and marketing team' },
    { name: 'HR', description: 'Human resources department' },
    { name: 'Finance', description: 'Finance and accounting' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: { description: dept.description },
      create: dept,
    });
  }

  logger.info('Development data seeded successfully');
}

// Utility function to reset database (for development)
export async function resetDatabase() {
  if (config.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }

  logger.warn('Resetting database...');
  
  // Get all table names
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  // Delete all data from tables
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        logger.warn(`Failed to truncate table ${tablename}:`, error);
      }
    }
  }

  logger.info('Database reset completed');
}

// Run seed if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      logger.error('Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default main;
