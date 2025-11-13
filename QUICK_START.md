# Quick Start Guide - Production Ready

## Prerequisites
- Node.js 18+
- Supabase account
- Domain (for production)

## Step 1: Environment Setup (5 minutes)

1. Create Supabase project at https://supabase.com
2. Get credentials from project settings
3. Copy configuration:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
4. Fill in Supabase credentials in \`.env.local\`

## Step 2: Database Setup (10 minutes)

1. Go to Supabase Dashboard → SQL Editor
2. Create new query and paste \`/scripts/01-create-schema.sql\`
3. Click "Run" to create tables and indexes
4. Verify tables created successfully

## Step 3: Create First Users

1. Generate password hash:
   \`\`\`bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123', 10))"
   \`\`\`

2. Insert user in Supabase SQL Editor:
   \`\`\`sql
   INSERT INTO users (registration_number, name, email, password_hash, role) 
   VALUES ('ADMIN001', 'Admin Name', 'admin@mmust.ac.ke', '[paste_hash_here]', 'admin');
   \`\`\`

## Step 4: Run Locally (5 minutes)

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit http://localhost:3000 and login with your created credentials.

## Step 5: Deploy to Vercel (5 minutes)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
5. Click Deploy

## Common Issues

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Verify .env.local has Supabase credentials
- Restart dev server after adding variables

### Login fails with "Invalid credentials"
- Check user exists in Supabase database
- Verify password hash was created with bcryptjs

### Database migration error
- Copy entire script from 01-create-schema.sql
- Run in Supabase SQL Editor (not in code)
- Check for syntax errors in output

## Next Steps

1. Configure email service (Resend/SendGrid)
2. Set up IoT gate scanners with /api/gate/scan
3. Create student and admin accounts
4. Enable 2FA in security settings
5. Set up monitoring and error tracking

## Full Documentation

- **API Reference**: /docs/API_DOCUMENTATION.md
- **Deployment**: /docs/DEPLOYMENT_GUIDE.md
- **Database**: View schema in Supabase dashboard

## Support

Check logs:
\`\`\`bash
# Browser: DevTools Console (F12)
# Server: Terminal where npm run dev runs
# Database: Supabase Dashboard → Logs
\`\`\`

For help: it-support@mmust.ac.ke
