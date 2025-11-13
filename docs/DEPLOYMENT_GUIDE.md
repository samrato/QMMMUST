# Deployment Guide

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account with project set up
- Vercel account (or your hosting provider)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Email service (Resend, SendGrid, etc.)
# RESEND_API_KEY=xxx
# SENDGRID_API_KEY=xxx
\`\`\`

## Database Setup

1. **Run migration script:**
   - Execute `/scripts/01-create-schema.sql` in Supabase SQL Editor
   - This creates all tables and inserts test credentials

2. **Enable Row Level Security (RLS) - IMPORTANT:**
   \`\`\`sql
   -- Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
   ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
   -- ... etc
   \`\`\`

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then redeploy for changes to take effect
\`\`\`

### Option 2: Deploy to Other Platforms

**Netlify:**
\`\`\`bash
npm run build
netlify deploy --prod --dir=.next
\`\`\`

**Docker (Self-hosted):**
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Production Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure CORS in production
- [ ] Set up email service (Resend, SendGrid, AWS SES)
- [ ] Enable database backups
- [ ] Configure monitoring and alerting
- [ ] Set up proper logging
- [ ] Review and enforce RLS policies
- [ ] Set up rate limiting
- [ ] Configure CDN for static assets
- [ ] Set up SSL/TLS certificate monitoring

## Monitoring

### Key Metrics to Monitor
- API response times
- Database query performance
- Email delivery rates
- Failed gate attempts
- System uptime

### Logging
All errors are logged with timestamps. Check:
- Browser console (development)
- Server logs (production)
- Supabase dashboard (database issues)

## Troubleshooting

### "Invalid JWT" Error
- Verify JWT_SECRET matches across all environments
- Check token expiration time
- Ensure Authorization header format: `Bearer {token}`

### Database Connection Issues
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct
- Check network connectivity
- Ensure database tables exist (run migration)

### "No token provided"
- Verify localStorage is not disabled
- Check browser cookies settings
- Ensure token is stored after login

## Support

For deployment issues:
1. Check Vercel logs: `vercel logs`
2. Check Supabase logs: Dashboard → Logs
3. Check browser console for client-side errors
4. Contact support@qmmust.ac.ke
