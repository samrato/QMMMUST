# QMMUST Gate Pass System

A comprehensive smart gate pass system for authenticating, monitoring, and logging device movements within Masinde Muliro University (MMUST) premises.

## Features

### For Students
- Dashboard with device overview and activity
- Generate QR codes and PINs for gate entry/exit
- Manage registered devices
- View movement logs and history
- Profile management
- Password change functionality
- Real-time notifications

### For Admins
- System overview with key metrics and charts
- Student management and search
- Complete asset/device tracking logs
- Email alerts and notifications
- System settings and configuration
- Real-time dashboard updates

### System Features
- JWT-based authentication
- Supabase PostgreSQL database with proper indexing
- Realtime updates via Supabase Realtime
- Email notifications ready for integration
- RFID tag and PIN verification
- Role-based access control (RBAC)
- Comprehensive API documentation
- Production-ready security

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | Supabase PostgreSQL |
| Authentication | JWT + Supabase |
| State | React Hooks + SWR |
| UI Components | shadcn/ui, Radix UI |
| Charts | Recharts |
| Notifications | Sonner |
| Icons | Lucide React |

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

1. **Clone and install:**
\`\`\`bash
npm install
\`\`\`

2. **Set up environment variables:**
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
\`\`\`

3. **Set up database:**
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Run the contents of \`/scripts/01-create-schema.sql\`

4. **Run development server:**
\`\`\`bash
npm run dev
\`\`\`

5. **First user setup:**
   - Create admin and student accounts via database
   - Hash passwords using bcryptjs
   - Login with credentials

## Project Structure

\`\`\`
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── student/           # Student API
│   │   ├── admin/             # Admin API
│   │   ├── gate/              # IoT gate scanner API
│   │   └── notifications/     # Email notification endpoints
│   ├── student/               # Student portal pages
│   ├── admin/                 # Admin dashboard pages
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Login page
│
├── components/
│   ├── student/               # Student components
│   ├── admin/                 # Admin components
│   └── ui/                    # shadcn/ui components
│
├── lib/
│   ├── supabase/             # Supabase client/server
│   ├── utils/                # Utilities (JWT, helpers)
│   └── hooks/                # React hooks (realtime)
│
├── scripts/
│   └── 01-create-schema.sql  # Database migration
│
└── docs/
    ├── API_DOCUMENTATION.md  # Full API reference
    └── DEPLOYMENT_GUIDE.md   # Production deployment
\`\`\`

## API Overview

### Authentication
- \`POST /api/auth/login\` - User login with registration number and password

### Student APIs
- \`GET/PUT /api/student/profile\` - Profile management and password change
- \`GET/POST /api/student/devices\` - Device management
- \`POST /api/student/generate-pass\` - Generate QR & PIN
- \`GET /api/student/movements\` - Movement history

### Admin APIs
- \`GET /api/admin/dashboard\` - Dashboard statistics
- \`GET /api/admin/students\` - Student list with search
- \`GET/PUT /api/admin/students/{id}\` - Student details
- \`GET /api/admin/logs\` - Asset/gate logs
- \`GET /api/admin/alerts\` - Notifications

### IoT Gate Scanner
- \`POST /api/gate/scan\` - RFID + PIN verification

Full API documentation available in \`/docs/API_DOCUMENTATION.md\`

## Database Schema

### Tables
- \`users\` - Students and admins with hashed passwords
- \`devices\` - Registered laptops/assets with RFID tags
- \`gate_passes\` - QR codes and PINs with expiration
- \`movements\` - Entry/exit logs with timestamps
- \`alerts\` - Email notifications tracking
- \`failed_attempts\` - Security incident logging
- \`admin_settings\` - System configuration

All tables include proper indexes and relationships for optimal performance.

## Authentication Flow

1. User enters registration number and password
2. Backend validates credentials against Supabase database
3. Password verified using bcrypt comparison
4. JWT token generated with user ID, role, and email
5. Token stored in localStorage (secure in production)
6. All requests include Authorization header with token
7. Role-based routing enforces access control

## Realtime Features

The system uses Supabase Realtime for live updates:

\`\`\`typescript
const channel = supabase.channel('movements')
  .on('postgres_changes', { event: '*', table: 'movements' }, (payload) => {
    console.log('New movement:', payload)
  })
  .subscribe()
\`\`\`

## Deployment

### Deploy to Vercel (Recommended)
\`\`\`bash
vercel deploy
# Follow prompts to add environment variables
\`\`\`

### Deploy with Docker
\`\`\`bash
docker build -t qmmust-gatepass .
docker run -p 3000:3000 qmmust-gatepass
\`\`\`

See \`/docs/DEPLOYMENT_GUIDE.md\` for detailed instructions.

## Setting Up First Users

To create users in Supabase:

1. Hash passwords using bcryptjs:
\`\`\`bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10))"
\`\`\`

2. Insert into database:
\`\`\`sql
INSERT INTO users (registration_number, name, email, password_hash, role) 
VALUES ('ADMIN001', 'Admin Name', 'admin@mmust.ac.ke', '[hashed_password]', 'admin');
\`\`\`

## Email Notifications

The system is ready to send email notifications. To enable:

1. Choose email service (Resend, SendGrid, AWS SES)
2. Add API key to environment variables
3. Implement email sending in \`/app/api/notifications/send-email/route.ts\`

Example with Resend:
\`\`\`typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({
  from: 'alert@qmmust.ac.ke',
  to: email,
  subject: subject,
  html: message
})
\`\`\`

## Security Considerations

- JWT tokens expire after 24 hours
- All passwords hashed with bcrypt (10 rounds)
- Input validation and sanitization on all endpoints
- SQL injection prevention through parameterized queries
- CORS properly configured for API routes
- Rate limiting recommended on auth endpoints
- HTTPS enforced in production
- Environment variables properly managed

## Troubleshooting

### "Invalid credentials" on login
- Verify Supabase connection in environment variables
- Check that user exists in database
- Verify password hash is valid bcrypt hash

### "No token found"
- Ensure localStorage is enabled in browser
- Check browser console for errors
- Verify authentication endpoint responds correctly

### Realtime updates not working
- Enable Realtime in Supabase dashboard (Settings → Realtime)
- Check browser WebSocket connection
- Verify network tab shows successful subscription

## Production Checklist

- [ ] Update JWT_SECRET with strong random value
- [ ] Set all Supabase environment variables
- [ ] Run database migration script
- [ ] Create production user accounts
- [ ] Test all authentication flows
- [ ] Configure email service for notifications
- [ ] Set up monitoring and error tracking
- [ ] Enable HTTPS and secure cookies
- [ ] Configure CORS properly
- [ ] Set rate limiting on API routes
- [ ] Test IoT gate scanner integration
- [ ] Document backup and recovery procedures

## Support

For issues or questions:
- Check \`/docs/\` directory for detailed documentation
- Review API responses for error messages
- Check browser console and server logs
- Contact: it-support@mmust.ac.ke

## License

Proprietary - Masinde Muliro University the Gate pass system
