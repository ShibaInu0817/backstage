# API Gateway

Simple HTTP proxy that routes requests to microservices. **No business logic** - pure routing.

## Quick Start

```bash
# Start the gateway
npm run start api-gateway

# Test it
curl http://localhost:3000/api/health
curl "http://localhost:3000/api/messages?conversationId=123"
```

## Architecture

```
Client → API Gateway :3000 → Microservices
                              ├── message-service :3001
                              └── other services...
```

## Adding a New Service

**1. Edit config file:**
```bash
vim apps/api-gateway/config/proxy-config.json
```

**2. Add your service:**
```json
{
  "$schema": "./proxy-config.schema.json",
  "services": [
    {
      "path": "/api/messages",
      "target": "http://localhost:3001",
      "pathRewrite": { "^/api/messages": "/messages" },
      "enabled": true
    },
    {
      "path": "/api/users",
      "target": "http://localhost:3002",
      "pathRewrite": { "^/api/users": "/users" },
      "enabled": true
    }
  ],
  "defaultTimeout": 30000,
  "logLevel": "info"
}
```

**3. Restart (no rebuild needed):**
```bash
npm run start api-gateway
```

## Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `path` | URL path to match | `"/api/messages"` |
| `target` | Backend service URL | `"http://localhost:3001"` |
| `pathRewrite` | Rewrite path before forwarding | `{"^/api/messages": "/messages"}` |
| `enabled` | Enable/disable route | `true` or `false` |
| `defaultTimeout` | Request timeout (ms) | `30000` |
| `logLevel` | Logging level | `"info"`, `"debug"`, `"error"` |

## Common Tasks

### Disable a Service
```json
{ "path": "/api/old-service", "enabled": false }
```

### Change Timeout
```json
{ "defaultTimeout": 60000 }
```

### Debug Requests
```json
{ "logLevel": "debug" }
```

### Different Environments

**Option 1: Environment Variable**
```bash
# Point to different config files
PROXY_CONFIG_FILE_PATH=./config/proxy-config.production.json npm run start
```

**Option 2: Docker Volume**
```bash
# Mount production config
docker run -v ./proxy-config.production.json:/app/config/proxy-config.json api-gateway
```

**Option 3: Environment Variable in Docker**
```bash
# Point to mounted config
docker run \
  -v ./configs:/configs \
  -e PROXY_CONFIG_FILE_PATH=/configs/production.json \
  api-gateway
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api` | Swagger documentation |
| `/api/*` | Proxied to backend services |

## Error Responses

**502 Bad Gateway** (when service is down):
```json
{
  "error": "Bad Gateway",
  "message": "Service is unavailable: /api/messages",
  "statusCode": 502
}
```

## Environment Variables

```bash
PORT=3000                           # Gateway port
CORS_ORIGIN=*                       # CORS origins
PROXY_CONFIG_FILE_PATH=             # Custom config file path (optional)
```

### Custom Config Path

By default, the gateway loads `config/proxy-config.json`. Override with:

```bash
# Use a different config file
PROXY_CONFIG_FILE_PATH=/path/to/custom-config.json npm run start api-gateway

# Production example
PROXY_CONFIG_FILE_PATH=/etc/api-gateway/proxy-config.production.json npm run start
```

## Production Deployment

**Docker Compose:**
```yaml
services:
  api-gateway:
    image: api-gateway
    ports:
      - "3000:3000"
    environment:
      - PROXY_CONFIG_FILE_PATH=/configs/proxy-config.production.json
    volumes:
      - ./configs:/configs
```

**Kubernetes:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gateway-config
data:
  proxy-config.json: |
    { "services": [...] }
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: gateway
        volumeMounts:
        - name: config
          mountPath: /app/config/proxy-config.json
          subPath: proxy-config.json
      volumes:
      - name: config
        configMap:
          name: gateway-config
```

## Best Practices

✅ Keep it stateless  
✅ Edit config file, not code  
✅ Use `enabled: false` instead of deleting  
✅ Monitor logs for errors  
✅ Run multiple instances for HA  

❌ Don't add business logic  
❌ Don't store state  
❌ Don't commit production URLs  

## Troubleshooting

**Service not proxying?**
- Check `enabled: true`
- Verify path matches exactly (case-sensitive)
- Set `logLevel: "debug"` to see requests
- Check backend service is running

**Config not loading?**
```bash
# Validate JSON syntax
jq . config/proxy-config.json
```

