# Installation and Setup Guide - Peer Rank Code Review Platform

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Prerequisites

### System Requirements

**Minimum Requirements:**
- Node.js 18.0 or higher
- npm 8.0 or higher (or yarn 1.22+)
- 2GB RAM
- 1GB free disk space
- Modern web browser

**Recommended Requirements:**
- Node.js 20.0 or higher
- npm 10.0 or higher
- 4GB RAM
- 5GB free disk space
- SSD storage for better performance

### Development Tools

**Required:**
- Git (for version control)
- Code editor (VS Code recommended)
- Terminal/Command prompt

**Optional but Recommended:**
- PM2 (for production process management)
- Docker (for containerized deployment)
- Nginx (for reverse proxy in production)

---

## Installation Methods

### Method 1: Clone from Repository

```bash
# Clone the repository
git clone https://github.com/lokendarjangid/code_editor_.git

# Navigate to project directory
cd code_editor_

# Install dependencies
npm install

# Start development server
npm run dev
```

### Method 2: Download ZIP

1. Download the project ZIP file
2. Extract to your desired location
3. Open terminal in the extracted folder
4. Run installation commands:

```bash
npm install
npm run dev
```

### Method 3: Docker Installation

```bash
# Clone repository
git clone https://github.com/lokendarjangid/code_editor_.git
cd code_editor_

# Build Docker image
docker build -t peer-rank-code-review .

# Run container
docker run -p 3000:3000 peer-rank-code-review
```

---

## Development Setup

### Step 1: Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output v18.0.0 or higher

# Check npm version
npm --version
# Should output 8.0.0 or higher

# Check Git installation
git --version
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Environment Configuration

Create a `.env.local` file in the project root:

```env
# Development Environment Variables
NODE_ENV=development
PORT=3000

# WebSocket Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Session Configuration
SESSION_CLEANUP_INTERVAL=300000
SESSION_TIMEOUT=1800000

# Code Execution
CODE_EXECUTION_TIMEOUT=10000
MAX_CODE_LENGTH=50000
MAX_COMMENT_LENGTH=1000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Debug Settings
DEBUG=false
LOG_LEVEL=info
```

### Step 4: Start Development Server

```bash
# Start the development server
npm run dev

# Server will start at http://localhost:3000
# WebSocket server runs on the same port
```

### Step 5: Verify Installation

1. Open browser and navigate to `http://localhost:3000`
2. You should see the Peer Rank landing page
3. Try creating a test session to verify functionality

### Development Workflow

**Hot Reloading:**
- Next.js provides automatic hot reloading
- Changes to React components update instantly
- Server-side changes require manual restart

**File Watching:**
```bash
# Development server with file watching
npm run dev

# Build for testing
npm run build

# Lint code
npm run lint
```

---

## Production Deployment

### Method 1: Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Environment Variables in Vercel:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add all required environment variables
- Redeploy after adding variables

### Method 2: Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Method 3: Heroku Deployment

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# Deploy
git push heroku main
```

### Method 4: VPS/Cloud Server

#### Step 1: Server Setup

```bash
# Update system (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

#### Step 2: Application Deployment

```bash
# Clone repository
git clone https://github.com/lokendarjangid/code_editor_.git
cd code_editor_

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

#### Step 3: Nginx Configuration (Optional)

Create `/etc/nginx/sites-available/peer-rank`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO specific
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/peer-rank /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Method 5: Docker Deployment

#### Build and Run Locally

```bash
# Build Docker image
docker build -t peer-rank-code-review .

# Run container
docker run -d \
  --name peer-rank \
  -p 3000:3000 \
  -e NODE_ENV=production \
  peer-rank-code-review
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

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
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    restart: unless-stopped
```

Deploy with Docker Compose:
```bash
docker-compose up -d --build
```

---

## Configuration

### Environment Variables

#### Development Configuration

```env
# .env.local
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
DEBUG=true
LOG_LEVEL=debug
```

#### Production Configuration

```env
# .env.production
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
NEXT_PUBLIC_DOMAIN=yourdomain.com
NEXT_PUBLIC_PROTOCOL=https

# Session Management
SESSION_CLEANUP_INTERVAL=300000
SESSION_TIMEOUT=3600000
MAX_SESSIONS=1000

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Code Execution
CODE_TIMEOUT=5000
MAX_CODE_LENGTH=10000
DISABLE_CODE_EXECUTION=false

# Storage
SESSIONS_DIR=/app/data/sessions
LOGS_DIR=/app/logs

# Monitoring
LOG_LEVEL=info
DEBUG=false
```

### Next.js Configuration

Update `next.config.mjs` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Output configuration
  output: 'standalone',
  poweredByHeader: false,

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
```

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'peer-rank-code-review',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_error_code: 1,
    },
  ],
};
```

---

## Testing

### Running Tests

```bash
# Install testing dependencies (if not included)
npm install --save-dev jest @testing-library/react

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Landing page loads correctly
- [ ] Session creation works
- [ ] Room code generation is unique
- [ ] Participants can join sessions
- [ ] Real-time code editing functions
- [ ] Comments and voting work
- [ ] Session summary generates correctly

**Cross-Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile Testing:**
- [ ] Responsive design works on mobile
- [ ] Touch interactions function properly
- [ ] Panel toggling works on small screens

**Performance Testing:**
```bash
# Load testing with multiple users
# Use tools like Artillery or k6 for stress testing

# Memory usage monitoring
node --inspect server.js

# Performance profiling
npm run build
npm run start
# Monitor with browser dev tools
```

### Health Checks

Create health check scripts:

```javascript
// scripts/health-check.js
const http = require('http');

function healthCheck() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed');
      process.exit(0);
    } else {
      console.error('❌ Health check failed');
      process.exit(1);
    }
  });

  req.on('error', (err) => {
    console.error('❌ Health check error:', err.message);
    process.exit(1);
  });

  req.end();
}

healthCheck();
```

---

## Troubleshooting

### Common Installation Issues

**Issue: npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Issue: Port 3000 already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Issue: Permission errors (Linux/macOS)**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use node version manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Runtime Issues

**Issue: Socket.IO connection fails**
- Check firewall settings
- Verify WebSocket support in browser
- Test with different browser
- Check network proxy settings

**Issue: Code execution not working**
- Verify Node.js/Python are installed on server
- Check file permissions for temp directories
- Review security settings
- Test with simple code examples

**Issue: Session data loss**
- Check file system permissions
- Verify disk space availability
- Review session cleanup settings
- Check error logs for file write issues

### Performance Issues

**Issue: Slow loading times**
```bash
# Optimize build
npm run build

# Analyze bundle size
npx @next/bundle-analyzer

# Check for memory leaks
node --inspect server.js
```

**Issue: High memory usage**
- Monitor with PM2: `pm2 monit`
- Adjust PM2 memory limits
- Review session cleanup intervals
- Consider using database instead of file storage

### Logging and Debugging

**Enable debug logging:**
```bash
# Development
DEBUG=* npm run dev

# Production
NODE_ENV=production DEBUG=socket.io* npm start
```

**Check logs:**
```bash
# PM2 logs
pm2 logs

# Application logs
tail -f logs/combined.log

# System logs (Linux)
journalctl -u your-service-name
```

---

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor application logs
- Check system resource usage
- Verify service health

**Weekly:**
- Review session storage usage
- Update dependencies (security patches)
- Backup session data
- Performance monitoring

**Monthly:**
- Full system updates
- Dependency security audit
- Performance optimization review
- User feedback analysis

### Backup Strategy

**Session Data Backup:**
```bash
#!/bin/bash
# backup-sessions.sh

BACKUP_DIR="/backups/peer-rank"
DATE=$(date +%Y%m%d_%H%M%S)
SESSION_DIR="./tmp/sessions"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup sessions
tar -czf "$BACKUP_DIR/sessions_$DATE.tar.gz" "$SESSION_DIR"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "sessions_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/sessions_$DATE.tar.gz"
```

**Database Backup (if using PostgreSQL):**
```bash
#!/bin/bash
# backup-database.sh

pg_dump peer_rank_db > "backup_$(date +%Y%m%d_%H%M%S).sql"
```

### Updates and Security

**Dependency Updates:**
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

**Security Monitoring:**
```bash
# Automated security scanning
npm install -g snyk
snyk test
snyk monitor
```

### Monitoring Setup

**PM2 Monitoring:**
```bash
# Enable PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor resources
pm2 monit
```

**Custom Monitoring Script:**
```javascript
// scripts/monitor.js
const http = require('http');
const fs = require('fs');

function logMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    cpu: process.cpuUsage(),
  };

  fs.appendFileSync('logs/metrics.log', JSON.stringify(metrics) + '\n');
}

// Log metrics every 5 minutes
setInterval(logMetrics, 5 * 60 * 1000);

// Health check every minute
setInterval(() => {
  const req = http.request('http://localhost:3000/api/health', (res) => {
    if (res.statusCode !== 200) {
      console.error('Health check failed:', res.statusCode);
    }
  });
  
  req.on('error', (err) => {
    console.error('Health check error:', err.message);
  });
  
  req.end();
}, 60 * 1000);
```

This installation and setup guide provides comprehensive instructions for getting the Peer Rank Code Review Platform running in both development and production environments.
