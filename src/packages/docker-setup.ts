/**
 * Docker Setup for Supabase At Home Pack
 * 
 * Provides Docker container management, compose file generation,
 * and container orchestration for local development.
 */

import { DockerEnvironment, DockerCompose, DockerContainer } from './types.js';

export class DockerSetupManager {
  private config: any;
  private environment: DockerEnvironment;
  private initialized = false;

  /**
   * Initialize Docker setup
   */
  async initialize(config: any): Promise<void> {
    this.config = config;
    this.environment = {
      running: false,
      containers: new Map(),
      networks: new Map(),
      volumes: new Map(),
      compose: {
        file: config.compose,
        version: '3.8',
        services: new Map(),
        networks: new Map(),
        volumes: new Map()
      }
    };
    
    await this.loadComposeFile();
    this.initialized = true;
  }

  /**
   * Start Docker containers
   */
  async start(): Promise<void> {
    try {
      // Start Docker Compose
      await this.runDockerCommand(['up', '-d'], { cwd: process.cwd() });
      
      // Wait for containers to be ready
      await this.waitForContainers();
      
      // Load container information
      await this.loadContainers();
      
      this.environment.running = true;
    } catch (error) {
      console.error('Failed to start Docker containers:', error);
      throw error;
    }
  }

  /**
   * Stop Docker containers
   */
  async stop(): Promise<void> {
    try {
      await this.runDockerCommand(['down'], { cwd: process.cwd() });
      
      this.environment.containers.clear();
      this.environment.running = false;
    } catch (error) {
      console.error('Failed to stop Docker containers:', error);
      throw error;
    }
  }

  /**
   * Restart Docker containers
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * Get container status
   */
  async getStatus(): Promise<boolean> {
    try {
      const result = await this.runDockerCommand(['ps', '--format', 'json'], { cwd: process.cwd() });
      const containers = JSON.parse(result.stdout);
      
      return containers.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get container logs
   */
  async getLogs(service?: string, options: {
    follow?: boolean;
    tail?: number;
    since?: string;
  } = {}): Promise<string> {
    try {
      const command = ['logs'];
      
      if (options.follow) {
        command.push('-f');
      }
      
      if (options.tail) {
        command.push('--tail', options.tail.toString());
      }
      
      if (options.since) {
        command.push('--since', options.since);
      }
      
      if (service) {
        command.push(service);
      }
      
      const result = await this.runDockerCommand(command, { cwd: process.cwd() });
      return result.stdout;
    } catch (error) {
      console.error('Failed to get logs:', error);
      throw error;
    }
  }

  /**
   * Execute command in container
   */
  async execCommand(container: string, command: string[]): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }> {
    try {
      const execCommand = ['exec', container, ...command];
      const result = await this.runDockerCommand(execCommand, { cwd: process.cwd() });
      
      return {
        exitCode: result.exitCode || 0,
        stdout: result.stdout,
        stderr: result.stderr
      };
    } catch (error) {
      console.error('Failed to execute command:', error);
      throw error;
    }
  }

  /**
   * Get container information
   */
  async getContainer(name: string): Promise<DockerContainer | null> {
    const container = this.environment.containers.get(name);
    if (container) return container;

    try {
      const result = await this.runDockerCommand(['ps', '--filter', `name=${name}`, '--format', 'json'], { cwd: process.cwd() });
      const containers = JSON.parse(result.stdout);
      
      if (containers.length === 0) return null;
      
      const containerData = containers[0];
      const dockerContainer: DockerContainer = {
        id: containerData.ID,
        name: containerData.Names[0],
        image: containerData.Image,
        status: this.parseStatus(containerData.Status),
        ports: this.parsePorts(containerData.Ports),
        environment: this.parseEnvironment(containerData.Labels),
        health: {
          status: 'healthy',
          lastCheck: new Date(),
          exitCode: 0,
          logs: []
        }
      };

      this.environment.containers.set(name, dockerContainer);
      return dockerContainer;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate Docker Compose file
   */
  generateComposeFile(config: any): string {
    const services = this.generateServices(config);
    const networks = this.generateNetworks(config);
    const volumes = this.generateVolumes(config);

    return `version: '${config.docker.version || '3.8'}'

services:
${services}

networks:
${networks}

volumes:
${volumes}
`;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    this.environment.containers.clear();
    this.environment.networks.clear();
    this.environment.volumes.clear();
  }

  private async loadComposeFile(): Promise<void> {
    try {
      const composeContent = this.generateComposeFile(this.config);
      await this.writeFile(this.config.compose, composeContent);
    } catch (error) {
      console.error('Failed to load compose file:', error);
    }
  }

  private async waitForContainers(): Promise<void> {
    const services = this.config.services;
    
    for (const service of services) {
      await this.waitForService(service);
    }
  }

  private async waitForService(service: string, maxAttempts: number = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const container = await this.getContainer(service);
        if (container && container.status === 'running') {
          return;
        }
      } catch (error) {
        // Container not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`Service ${service} failed to start within ${maxAttempts * 2} seconds`);
  }

  private async loadContainers(): Promise<void> {
    const services = this.config.services;
    
    for (const service of services) {
      await this.getContainer(service);
    }
  }

  private generateServices(config: any): string {
    const services: string[] = [];

    // PostgreSQL service
    services.push(`  postgres:
    image: postgres:15
    container_name: supabase_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_INITDB_ARGS: --auth-host=crc32sha256
    volumes:
      - ./volumes/postgres/data:/var/lib/postgresql/data
      - ./supabase/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "${config.ports.postgres}:5432"
    command: postgres -c config_file=/etc/postgresql/postgresql.conf -c hba_file=/etc/postgresql/pg_hba.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - supabase_network`);

    // Kong Gateway service
    services.push(`  kong:
    image: kong:3.0
    container_name: supabase_kong
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
      KONG_ADMIN_GUI_URL: http://localhost:8002
    volumes:
      - ./kong/kong.yml:/kong/declarative/kong.yml
    ports:
      - "${config.ports.kong}:8000"
      - "8001:8001"
      - "8002:8002"
    healthcheck:
      test: ["CMD", "kong", "health"]
      interval: 10s
      timeout: 10s
      retries: 10
    networks:
      - supabase_network`);

    // Supabase/PostgREST service
    services.push(`  supabase:
    image: postgrest/postgrest:latest
    container_name: supabase_postgrest
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PGRST_DB_URI: postgres://authenticator:your_password_here@postgres:5432/postgres
      PGRST_DB_SCHEMAS: public,storage,graphql_public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: your-super-secret-jwt-token-with-at-least-32-characters-long
      PGRST_DB_USE_LEGACY_GUCS: "false"
    command: "postgrest"
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - supabase_network`);

    // Supabase Auth service
    services.push(`  auth:
    image: supabase/gotrue:v2.38.0
    container_name: supabase_auth
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: http://localhost:9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://supabase_auth_admin:postgres@postgres:5432/postgres
      GOTRUE_SITE_URL: http://localhost:3000
      GOTRUE_URI_ALLOW_LIST: "*"
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_JWT_ADMIN_ROLES: service_role
      GOTRUE_JWT_AUD: authenticated
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_SECRET: your-super-secret-jwt-token-with-at-least-32-characters-long
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "true"
      GOTRUE_SMTP_HOST: inbucket
      GOTRUE_SMTP_PORT: 2500
      GOTRUE_SMTP_USER: ""
      GOTRUE_SMTP_PASS: ""
      GOTRUE_SMTP_ADMIN_EMAIL: admin@email.com
      GOTRUE_MAILER_URLS_CONFIRMATION: http://localhost:9999/verify
      GOTRUE_MAILER_URLS_INVITE: http://localhost:9999/invite
      GOTRUE_MAILER_URLS_RECOVERY: http://localhost:9999/recover
      GOTRUE_MAILER_URLS_EMAIL_CHANGE: http://localhost:9999/email-change
    ports:
      - "9999:9999"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9999/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - supabase_network`);

    // Supabase Storage service
    services.push(`  storage:
    image: supabase/storage-api:v0.28.5
    container_name: supabase_storage
    depends_on:
      postgres:
        condition: service_healthy
      auth:
        condition: service_healthy
    environment:
      ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
      POSTGREST_URL: http://supabase:3000
      PGRST_JWT_SECRET: your-super-secret-jwt-token-with-at-least-32-characters-long
      DATABASE_URL: postgres://supabase_storage_admin:postgres@postgres:5432/postgres
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: stub
      REGION: stub
      GLOBAL_S3_BUCKET: stub
    volumes:
      - ./volumes/storage:/var/lib/storage
    ports:
      - "5000:5000"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5000/status || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - supabase_network`);

    // Supabase Functions service
    services.push(`  functions:
    image: supabase/edge-runtime:v1.3.4
    container_name: supabase_edge_functions
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      JWT_SECRET: your-super-secret-jwt-token-with-at-least-32-characters-long
      SUPABASE_URL: http://kong:8000
      SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
      SUPABASE_DB_URL: postgres://postgres:postgres@postgres:5432/postgres
    volumes:
      - ./functions:/home/deno/functions
    ports:
      - "9000:9000"
    command: start --main-service /home/deno/functions
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9000/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - supabase_network`);

    // Supabase Studio service
    services.push(`  studio:
    image: supabase/studio:20231127-af42990
    container_name: supabase_studio
    depends_on:
      postgres:
        condition: service_healthy
      auth:
        condition: service_healthy
      api:
        condition: service_healthy
    environment:
      STUDIO_PG_META_URL: http://postgres:5432
      POSTGRES_PASSWORD: postgres
      DEFAULT_ORGANIZATION_NAME: Default Organization
      DEFAULT_PROJECT_NAME: Default Project
      SUPABASE_URL: http://kong:8000
      SUPABASE_PUBLIC_URL: http://kong:8000
      SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
    ports:
      - "${config.ports.studio}:3000"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/api/profile || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - supabase_network`);

    return services.join('\n\n');
  }

  private generateNetworks(config: any): string {
    return `  supabase_network:
    driver: bridge
    name: supabase_network`;
  }

  private generateVolumes(config: any): string {
    return `  postgres_data:
    driver: local
  storage_data:
    driver: local`;
  }

  private async runDockerCommand(args: string[], options: { cwd: string }): Promise<{
    stdout: string;
    stderr: string;
    exitCode?: number;
  }> {
    // Mock Docker command execution
    // In a real implementation, this would use child_process.spawn
    return {
      stdout: '',
      stderr: '',
      exitCode: 0
    };
  }

  private async writeFile(path: string, content: string): Promise<void> {
    // Mock file writing
    console.log(`Writing to ${path}`);
  }

  private parseStatus(status: string): 'running' | 'stopped' | 'error' {
    if (status.includes('Up')) return 'running';
    if (status.includes('Exited')) return 'stopped';
    return 'error';
  }

  private parsePorts(ports: any[]): Map<number, number> {
    const portMap = new Map<number, number>();
    
    ports.forEach(port => {
      if (port.PublicPort) {
        portMap.set(port.PrivatePort, port.PublicPort);
      }
    });
    
    return portMap;
  }

  private parseEnvironment(labels: any[]): Record<string, string> {
    const env: Record<string, string> = {};
    
    labels.forEach(label => {
      if (label.startsWith('com.docker.compose.project.environment.')) {
        const key = label.replace('com.docker.compose.project.environment.', '');
        env[key] = '';
      }
    });
    
    return env;
  }
}

// Export singleton instance
export const dockerSetup = new DockerSetupManager();
