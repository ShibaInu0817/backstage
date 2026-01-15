import { Logger } from '@nestjs/common';
import { Options } from 'http-proxy-middleware';
import * as fs from 'fs';
import * as path from 'path';

export interface ServiceProxyConfig {
  path: string;
  target: string;
  pathRewrite?: Record<string, string>;
  enabled?: boolean;
}

export interface ProxyConfiguration {
  services: ServiceProxyConfig[];
  defaultTimeout?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
}

/**
 * Load proxy configuration from JSON file
 * Reads from PROXY_CONFIG_FILE_PATH env variable or defaults to config/proxy-config.json
 */
export function loadProxyConfig(): ProxyConfiguration {
  // At runtime, __dirname points to dist/ where main.js is
  // Config files are copied to dist/config/ by webpack
  const configPath = path.join(
    __dirname,
    process.env.PROXY_CONFIG_FILE_PATH || 'config/proxy-config.json'
  );
  try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const config: ProxyConfiguration = JSON.parse(configFile);

    Logger.log(
      `📋 Loaded proxy configuration from ${configPath}`,
      'ProxyConfig'
    );

    return config;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    Logger.error(
      `Failed to load proxy configuration from ${configPath}: ${errorMessage}`,
      errorStack,
      'ProxyConfig'
    );
    throw new Error('Proxy configuration file not found or invalid');
  }
}

export const proxyConfig = loadProxyConfig();

// Only export enabled services
export const serviceProxyConfigs: ServiceProxyConfig[] =
  proxyConfig.services.filter((service) => service.enabled !== false);

export function createProxyOptions(config: ServiceProxyConfig): Options {
  const timeout = proxyConfig.defaultTimeout || 30000;
  const logLevel = proxyConfig.logLevel || 'info';
  const shouldLog = logLevel === 'debug' || logLevel === 'info';

  return {
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    timeout,
    proxyTimeout: timeout,
    onProxyReq: (proxyReq, req) => {
      if (shouldLog) {
        Logger.log(
          `[Proxy] ${req.method} ${req.url} -> ${config.target}${proxyReq.path}`,
          'ApiGateway'
        );
      }
    },
    onProxyRes: (proxyRes, req) => {
      if (shouldLog) {
        Logger.log(
          `[Proxy] ${req.method} ${req.url} <- ${proxyRes.statusCode}`,
          'ApiGateway'
        );
      }
    },
    onError: (err, req, res) => {
      Logger.error(
        `[Proxy Error] ${req.method} ${req.url}: ${err.message}`,
        err.stack,
        'ApiGateway'
      );
      if (!res.headersSent) {
        res.writeHead(502, {
          'Content-Type': 'application/json',
        });
        res.end(
          JSON.stringify({
            error: 'Bad Gateway',
            message: `Service is unavailable: ${config.path}`,
            statusCode: 502,
          })
        );
      }
    },
  };
}
