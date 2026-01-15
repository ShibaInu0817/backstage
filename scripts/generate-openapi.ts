import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = process.cwd();
const PROXY_CONFIG_PATH = path.join(ROOT_DIR, 'apps/api-gateway/src/config/proxy-config.json');

interface ServiceConfig {
  name: string;
  projectName: string;
  port: number;
  env?: Record<string, string>;
  isGateway?: boolean;
}

const SERVICES: ServiceConfig[] = [
  {
    name: 'api-gateway',
    projectName: '@boilerplate/api-gateway',
    port: 3000,
    isGateway: true
  },
  {
    name: 'message-service',
    projectName: '@boilerplate/message-service',
    port: 3001,
    env: {
      SAMPLE_TEMPLATE_MONGODB_HOSTS: 'mongodb://localhost:27017',
      SAMPLE_TEMPLATE_MONGODB_REPLICA_SET: 'mongodb-test',
      SAMPLE_TEMPLATE_MONGODB_DB_NAME: 'boilerplate',
      CLERK_SECRET_KEY: 'sk_test_dummy'
    }
  }
];

async function generate() {
  console.log('🚀 Starting Modular OpenAPI generation...');

  if (!fs.existsSync(PROXY_CONFIG_PATH)) {
    throw new Error(`Proxy config not found at ${PROXY_CONFIG_PATH}`);
  }
  const proxyConfig = JSON.parse(fs.readFileSync(PROXY_CONFIG_PATH, 'utf-8'));
  
  const tempFiles: string[] = [];

  for (const service of SERVICES) {
    console.log(`📦 Processing ${service.name}...`);
    
    // 1. Build the service
    console.log(`   - Building ${service.projectName}...`);
    execSync(`npx nx run ${service.projectName}:build`, { stdio: 'inherit' });
    
    // 2. Run in headless mode to export raw spec
    const distPath = path.join(ROOT_DIR, 'apps', service.name, 'dist');
    const tempFile = path.join(ROOT_DIR, 'apps', service.name, `temp-openapi-${Date.now()}.json`);
    tempFiles.push(tempFile);

    console.log(`   - Exporting raw spec...`);
    const envs = {
        ...process.env,
        PORT: String(service.port),
        GENERATE_OPENAPI: 'true',
        OPENAPI_OUTPUT_PATH: tempFile,
        ...service.env
    };

    execSync(`node ${path.join(distPath, 'main.js')}`, { 
      stdio: 'inherit',
      cwd: distPath,
      env: envs
    });

    // 3. Read and pre-process the raw spec
    if (!fs.existsSync(tempFile)) {
        console.error(`   ❌ Failed to generate spec for ${service.name}`);
        continue;
    }
    const spec = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
    
    // 4. Pre-process to be "Gateway-ready"
    console.log(`   - Pre-processing for Gateway compliance...`);
    
    // Set consistent servers (pointing to Gateway)
    spec.servers = [{
        url: 'http://127.0.0.1:3000',
        description: 'Local API Gateway'
    }];

    // Set consistent security schemes
    if (!spec.components) spec.components = {};
    if (!spec.components.securitySchemes) spec.components.securitySchemes = {};
    spec.components.securitySchemes.bearerAuth = {
        type: 'http',
        scheme: 'bearer'
    };
    spec.security = [{ bearerAuth: [] }];

    // Handle Path Prefixing
    if (!service.isGateway) {
        const targetUrl = `localhost:${service.port}`;
        const serviceProxy = proxyConfig.services.find((s: any) => s.target.includes(targetUrl));
        const prefix = serviceProxy ? serviceProxy.path : `/api/${service.name.replace('-service', '')}s`;
        
        const newPaths: any = {};
        for (const [pathKey, pathValue] of Object.entries<any>(spec.paths)) {
            let publicPath = pathKey;
            const rewriteRule = serviceProxy?.pathRewrite;
            
            if (rewriteRule) {
               let matched = false;
               for (const [_, replacement] of Object.entries(rewriteRule)) {
                   const regex = new RegExp(String(replacement));
                   if (pathKey.startsWith(String(replacement))) {
                       publicPath = pathKey.replace(regex, prefix.replace(/^\^/, ''));
                       matched = true;
                       break;
                   }
               }
               if (!matched) {
                   publicPath = path.posix.join(prefix, pathKey);
               }
            } else {
                publicPath = path.posix.join(prefix, pathKey);
            }
            
            newPaths['/' + publicPath.replace(/^\/+/, '')] = pathValue;
        }
        spec.paths = newPaths;
        console.log(`   - Applied prefix: ${prefix}`);
    } else {
        // For gateway itself, ensure paths are correct (e.g. /health -> /api/health if proxied)
    }

    // 5. Save the processed spec to the docs directory
    const finalSpecPath = path.join(ROOT_DIR, 'docs/api-reference/specs', `${service.name}.json`);
    fs.writeFileSync(finalSpecPath, JSON.stringify(spec, null, 2));
    console.log(`   ✅ Saved Gateway-ready spec to: ${finalSpecPath}`);
  }

  // 6. Cleanup
  console.log('🧹 Cleaning up temporary files...');
  for (const tempFile of tempFiles) {
    try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (e) {}
  }
}

generate().catch(err => {
  console.error('❌ Generation fatal error:', err);
  process.exit(1);
});
