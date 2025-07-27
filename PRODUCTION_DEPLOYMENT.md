# 🚀 Production Deployment Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Platform Deployment Options](#platform-deployment-options)
4. [Security Considerations](#security-considerations)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Basic Production Setup

```bash
# 1. Clone and install dependencies
git clone <your-repo>
cd code_editor_
npm install

# 2. Set environment variables
cp .env.example .env
# Edit .env with your production values

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

## Environment Setup

### 1. Create Environment File

Create `.env.production` in your project root:

```env
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Domain Configuration
NEXT_PUBLIC_DOMAIN=yourdomain.com
NEXT_PUBLIC_PROTOCOL=https

# Session Configuration
SESSION_CLEANUP_INTERVAL=300000
SESSION_TIMEOUT=3600000
MAX_SESSIONS=1000

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Code Execution Security
CODE_TIMEOUT=5000
MAX_CODE_LENGTH=10000
DISABLE_CODE_EXECUTION=false

# File Storage
SESSIONS_DIR=/app/data/sessions
LOGS_DIR=/app/logs

# Optional: Database (for persistent storage)
# DATABASE_URL=postgresql://user:pass@host:port/db
```

### 2. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js",
    "start:pm2": "pm2 start ecosystem.config.js",
    "stop": "pm2 stop all",
    "restart": "pm2 restart all",
    "logs": "pm2 logs",
    "lint": "next lint",
    "test": "jest"
  }
}
```

## Platform Deployment Options

### Option 1: Vercel (Recommended for ease)

1. **Install Vercel CLI:**

```bash
npm i -g vercel
```

2. **Deploy:**

```bash
vercel --prod
```

3. **Environment Variables in Vercel:**

- Go to your Vercel dashboard
- Add all environment variables from `.env.production`

### Option 2: Railway

1. **Install Railway CLI:**

```bash
npm install -g @railway/cli
```

2. **Deploy:**

```bash
railway login
railway init
railway up
```

### Option 3: Heroku

1. **Create Heroku app:**

```bash
heroku create your-app-name
```

2. **Set environment variables:**

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
# Add other env vars
```

3. **Deploy:**

```bash
git push heroku main
```

### Option 4: VPS/Cloud Server (DigitalOcean, AWS EC2, etc.)

#### Using PM2 for Process Management

1. **Install PM2:**

```bash
npm install -g pm2
```

2. **Create PM2 configuration:**
   Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "peer-rank-code-review",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
    },
  ],
};
```

3. **Deploy with PM2:**

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### Using Docker

1. **Create Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create directories and set permissions
RUN mkdir -p /app/tmp/sessions /app/logs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml:**

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

3. **Deploy with Docker:**

```bash
docker-compose up -d --build
```

## Security Considerations

### 1. Update next.config.mjs for Production

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output configuration for standalone deployment
  output: "standalone",

  // Disable powered by header
  poweredByHeader: false,

  // Production optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
};

export default nextConfig;
```

### 2. Nginx Configuration (for reverse proxy)

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name yourdomain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Rate limiting
            limit_req zone=api burst=20 nodelay;
        }

        # Socket.IO specific configuration
        location /socket.io/ {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Performance Optimization

### 1. Enable Production Optimizations

Update `server.js` for production:

```javascript
// Add at the top of server.js
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster && process.env.NODE_ENV === "production") {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Your existing server code here
  // ...
}
```

### 2. Database Migration (Optional)

For high-traffic production use, consider migrating from file storage to a database:

```javascript
// utils/databaseSessionStore.js
const { Pool } = require("pg");

class DatabaseSessionStore {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });
    this.init();
  }

  async init() {
    await this.pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                room_code VARCHAR(10) PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
  }

  async set(roomCode, data) {
    await this.pool.query(
      "INSERT INTO sessions (room_code, data) VALUES ($1, $2) ON CONFLICT (room_code) DO UPDATE SET data = $2, updated_at = NOW()",
      [roomCode, JSON.stringify(data)]
    );
  }

  async get(roomCode) {
    const result = await this.pool.query(
      "SELECT data FROM sessions WHERE room_code = $1",
      [roomCode]
    );
    return result.rows[0] ? JSON.parse(result.rows[0].data) : null;
  }

  async delete(roomCode) {
    await this.pool.query("DELETE FROM sessions WHERE room_code = $1", [
      roomCode,
    ]);
  }

  async cleanup() {
    await this.pool.query(
      "DELETE FROM sessions WHERE updated_at < NOW() - INTERVAL '1 hour'"
    );
  }
}

module.exports = new DatabaseSessionStore();
```

## Monitoring & Maintenance

### 1. Health Check Endpoint

Add to your Next.js API routes (`src/app/api/health/route.js`):

```javascript
export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  });
}
```

### 2. Logging Setup

Create `utils/logger.js`:

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "peer-rank-code-review" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

### 3. Basic Monitoring Script

Create `scripts/monitor.js`:

```javascript
const http = require("http");

function checkHealth() {
  const options = {
    hostname: process.env.MONITOR_HOST || "localhost",
    port: process.env.PORT || 3000,
    path: "/api/health",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log(`✅ Health check passed at ${new Date().toISOString()}`);
    } else {
      console.error(`❌ Health check failed: ${res.statusCode}`);
    }
  });

  req.on("error", (err) => {
    console.error(`❌ Health check error: ${err.message}`);
  });

  req.end();
}

// Run health check every 5 minutes
setInterval(checkHealth, 5 * 60 * 1000);
checkHealth(); // Run immediately
```

## Final Checklist

- [ ] Environment variables configured
- [ ] Build process successful (`npm run build`)
- [ ] Security headers implemented
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup strategy for session data
- [ ] Error logging implemented
- [ ] Performance testing completed
- [ ] Health checks enabled

## Production Commands

```bash
# Build for production
npm run build

# Start production server
npm start

# With PM2
pm2 start ecosystem.config.js --env production

# View logs
pm2 logs

# Monitor performance
pm2 monit

# Restart application
pm2 restart all
```

Your collaborative code review platform is now ready for production! 🚀
