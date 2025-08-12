# Fresh Kanban - Deployment Guide

This guide covers multiple deployment options for the Fresh Kanban application, from local development to production servers.

## 📋 Deployment Options Overview

### 1. Local Development
- **Purpose**: Development and testing
- **Access**: Local machine only
- **Requirements**: Node.js, npm/pnpm
- **URL**: http://localhost:3005

### 2. Production Standalone
- **Purpose**: Local production or server deployment
- **Access**: Network accessible
- **Requirements**: Node.js, build process
- **URL**: Configurable port

### 3. Cloud Platforms
- **Purpose**: Public web deployment
- **Access**: Internet accessible
- **Requirements**: Git repository, environment variables
- **URL**: Platform-provided domain

### 4. Docker Container
- **Purpose**: Containerized deployment
- **Access**: Portable across environments
- **Requirements**: Docker, Docker Compose
- **URL**: Configurable

## 🚀 Quick Start Scripts

### Windows Batch Scripts (Included)

#### `start-dev.bat`
Starts development server on port 3005:
```batch
# Double-click to run, or from command line:
start-dev.bat
```

#### `start-app.bat`
Builds and runs production version:
```batch
# Double-click to run, or from command line:
start-app.bat
```

## 🛠️ Manual Deployment Steps

### Local Development Setup

1. **Clone and Setup**
   ```bash
   git clone [repository-url]
   cd fresh-kanban
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_URL=http://localhost:3005
   NEXTAUTH_SECRET=your_secret_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   # or
   npx next dev -p 3005
   ```

### Production Build

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Custom Port**
   ```bash
   # Modify package.json or use:
   npx next start -p 8080
   ```

## ☁️ Cloud Platform Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Sign up at [vercel.com](https://vercel.com)
   - Import your Git repository
   - Choose "Next.js" framework preset

2. **Environment Variables**
   Add in Vercel dashboard:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   ```

3. **Deploy**
   - Automatic deployment on git push
   - Custom domains supported
   - SSL certificates included

### Netlify

1. **Site Configuration**
   - Connect Git repository
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   Set in Netlify dashboard:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_URL=https://your-app.netlify.app
   NEXTAUTH_SECRET=your_secret_key
   ```

### Railway

1. **Deploy from Git**
   - Connect repository
   - Railway auto-detects Next.js
   - Automatic builds and deployments

2. **Environment Variables**
   Configure in Railway dashboard

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Create this file as 'Dockerfile' in project root
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# Create this file as 'docker-compose.yml'
version: '3.8'

services:
  fresh-kanban:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    restart: unless-stopped
```

### Docker Commands

```bash
# Build and run with Docker
docker build -t fresh-kanban .
docker run -p 3000:3000 fresh-kanban

# Or use Docker Compose
docker-compose up -d
```

## 🖥️ Server Deployment

### VPS/Dedicated Server

1. **Install Node.js**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # CentOS/RHEL
   curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. **Clone and Setup**
   ```bash
   git clone [repository-url]
   cd fresh-kanban
   npm install
   npm run build
   ```

3. **Process Manager (PM2)**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start npm --name "fresh-kanban" -- start
   
   # Auto-start on boot
   pm2 startup
   pm2 save
   ```

4. **Reverse Proxy (Nginx)**
   ```nginx
   # /etc/nginx/sites-available/fresh-kanban
   server {
       listen 80;
       server_name your-domain.com;
       
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
   }
   ```

### Windows Server

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org)
   - Run installer with administrator privileges

2. **Deploy Application**
   ```cmd
   git clone [repository-url]
   cd fresh-kanban
   npm install
   npm run build
   ```

3. **Windows Service (using node-windows)**
   ```bash
   npm install -g node-windows
   # Create service script (service.js)
   ```

## 🔧 Environment Configuration

### Required Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | Supabase anonymous key |
| `NEXTAUTH_URL` | ✅ | ✅ | Application base URL |
| `NEXTAUTH_SECRET` | ✅ | ✅ | Secret for NextAuth |

### Environment-Specific Settings

#### Development (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXTAUTH_URL=http://localhost:3005
NODE_ENV=development
```

#### Production (`.env.production`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in package.json or use:
   npx next dev -p 3006
   ```

2. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build
   ```

3. **Environment Variables Not Loading**
   - Check file names (`.env.local` vs `.env`)
   - Verify variable names have `NEXT_PUBLIC_` prefix for client-side
   - Restart development server after changes

4. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies allow access

### Performance Optimization

1. **Enable Output File Tracing**
   ```javascript
   // next.config.mjs
   export default {
     experimental: {
       outputFileTracing: true,
     },
   }
   ```

2. **Static Asset Optimization**
   - Enable image optimization
   - Use CDN for static assets
   - Implement proper caching headers

## 📊 Monitoring

### Health Checks

1. **Application Status**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Database Connectivity**
   - Check Supabase dashboard
   - Monitor connection logs

### Logging

1. **Application Logs**
   ```bash
   # PM2 logs
   pm2 logs fresh-kanban
   
   # Docker logs
   docker logs container-name
   ```

2. **Error Tracking**
   - Implement Sentry or similar
   - Monitor browser console errors
   - Set up alerting for critical issues

## 🔒 Security Considerations

### Production Checklist

- [ ] Use HTTPS in production
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure CORS properly
- [ ] Enable Supabase RLS policies
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Implement rate limiting if needed

### Supabase Security

1. **Row Level Security**
   - Enable RLS on all tables
   - Create appropriate policies
   - Test with different user roles

2. **API Keys**
   - Use service role key only on server
   - Rotate keys periodically
   - Monitor usage in dashboard

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Multiple application instances
   - Session affinity if needed
   - Health check endpoints

2. **Database Scaling**
   - Supabase handles scaling automatically
   - Monitor connection limits
   - Consider read replicas for heavy reads

### Performance Monitoring

1. **Metrics to Track**
   - Response times
   - Error rates
   - Database query performance
   - User session duration

2. **Tools**
   - Vercel Analytics
   - Google Analytics
   - Supabase Dashboard
   - Custom monitoring solutions

This deployment guide covers all major scenarios from local development to enterprise production deployments. Choose the option that best fits your requirements and infrastructure.