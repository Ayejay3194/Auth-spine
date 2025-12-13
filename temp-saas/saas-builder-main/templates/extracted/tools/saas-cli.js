#!/usr/bin/env node

/**
 * Tiny helper CLI for common "turn template into app" tasks.
 *
 * Usage:
 *   node tools/saas-cli.js init-env
 *   node tools/saas-cli.js add-entity Project
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const command = args[0];

function log(msg) {
  process.stdout.write(msg + "\n");
}

function initEnv() {
  const examplePath = path.join(process.cwd(), ".env.example");
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(examplePath)) {
    log("No .env.example found in this directory.");
    process.exit(1);
  }

  if (fs.existsSync(envPath)) {
    log(".env already exists. Not overwriting.");
    return;
  }

  fs.copyFileSync(examplePath, envPath);
  log("Created .env from .env.example. Fill in the values before running the app.");
}

function addEntity(nameRaw) {
  if (!nameRaw) {
    log("Usage: node tools/saas-cli.js add-entity EntityName");
    process.exit(1);
  }

  const entityName = nameRaw.trim();
  const slug = entityName.toLowerCase() + "s";

  // Create dashboard page
  const pageDir = path.join(process.cwd(), "app", "(dashboard)", slug);
  const pagePath = path.join(pageDir, "page.tsx");

  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  if (!fs.existsSync(pagePath)) {
    const pageContent = `export default function ${entityName}ListPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">${entityName}s</h1>
      <p className="text-sm text-muted-foreground">
        This is the starter page for your ${entityName} entity. Hook it up to your data layer.
      </p>
    </section>
  );
}
`;
    fs.writeFileSync(pagePath, pageContent, "utf8");
    log("Created dashboard page: " + path.relative(process.cwd(), pagePath));
  } else {
    log("Dashboard page already exists for " + entityName);
  }

  // Create validation stub
  const validationDir = path.join(process.cwd(), "lib", "validation");
  const validationPath = path.join(validationDir, `${entityName.toLowerCase()}.ts`);

  if (!fs.existsSync(validationDir)) {
    fs.mkdirSync(validationDir, { recursive: true });
  }

  if (!fs.existsSync(validationPath)) {
    const validationContent = `import { z } from "zod";

export const create${entityName}Schema = z.object({
  // TODO: define fields for creating a ${entityName}
});

export const update${entityName}Schema = z.object({
  // TODO: define fields for updating a ${entityName}
});
`;
    fs.writeFileSync(validationPath, validationContent, "utf8");
    log("Created validation stub: " + path.relative(process.cwd(), validationPath));
  } else {
    log("Validation file already exists for " + entityName);
  }

  log("Remember to add a Prisma model for " + entityName + " in prisma/schema.prisma and run a migration.");
}

switch (command) {
  case "init-env":
    initEnv();
    break;
  case "add-entity":
    addEntity(args[1]);
    break;
  default:
    log("Usage:");
    log("  node tools/saas-cli.js init-env");
    log("  node tools/saas-cli.js add-entity EntityName");
    process.exit(1);
}
