# Testing Guide

## Manual Testing

### Login Testing

1. Go to http://localhost:3000
2. Try invalid credentials → should show error
3. Login with valid student credentials
4. Should redirect to `/student/dashboard`
5. Logout should redirect to login page

### Student Portal Testing

#### Dashboard
- [ ] Profile name displays correctly
- [ ] Device count shows registered devices
- [ ] Recent activity shows if any

#### Generate Pass
- [ ] Can select device from dropdown
- [ ] QR code generates and displays
- [ ] PIN is 6 digits
- [ ] Can download QR code

#### My Devices
- [ ] All devices display in table
- [ ] Device info shows RFID tag
- [ ] Registration date displays

#### Movement Logs
- [ ] Shows all movements for student
- [ ] Status badges color correctly
- [ ] Can filter by status
- [ ] Timestamps are accurate

#### Profile
- [ ] Shows current profile info
- [ ] Can edit name and email
- [ ] Registration number is read-only
- [ ] Save button works

### Admin Dashboard Testing

#### Overview
- [ ] Statistics cards load
- [ ] Chart displays weekly data
- [ ] Recent movements show
- [ ] Can see recent alerts

#### Students
- [ ] Search functionality works
- [ ] Student list filters
- [ ] Status badges show correctly
- [ ] Can click "View" for details

#### Asset Logs
- [ ] All logs display
- [ ] Status filter works
- [ ] Can see student, device, gate info
- [ ] Timestamps display

#### Alerts
- [ ] Shows all alerts
- [ ] Email status displays
- [ ] Alert type shows

#### Settings
- [ ] Can adjust failed attempt limit
- [ ] Can edit email template
- [ ] Can save settings

## Automated Testing (Setup)

\`\`\`bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
\`\`\`

### Example Test

\`\`\`typescript
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/page'

describe('Login Page', () => {
  it('should render login form', () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText(/registration number/i)).toBeInTheDocument()
  })
})
\`\`\`

## API Testing

### Using cURL

\`\`\`bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"registrationNumber":"CS/2021/001","password":"student123"}'

# Get devices (replace TOKEN with actual JWT)
curl http://localhost:3000/api/student/devices \
  -H "Authorization: Bearer TOKEN"

# Get dashboard
curl http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
\`\`\`

### Using Postman

1. Import collection from `/postman/collection.json`
2. Set environment variables
3. Run requests

## Security Testing

### Test Checklist
- [ ] JWT token validation on protected routes
- [ ] Role-based access enforcement
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF token validation
- [ ] Rate limiting on auth endpoints
- [ ] Password hashing in database

### SQL Injection Test
\`\`\`
Registration: admin' OR '1'='1
Password: password
\`\`\`
Should fail with "Invalid credentials"

### JWT Tampering
1. Login and copy token
2. Modify token payload
3. Use modified token
Should fail with "Invalid token"

## Performance Testing

\`\`\`bash
# Install k6
brew install k6

# Load test
k6 run performance-test.js
\`\`\`

## Database Testing

### Verify Schema
\`\`\`sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public'
\`\`\`

Should show all 7 tables.

### Verify Test Data
\`\`\`sql
SELECT * FROM users;
SELECT * FROM devices;
\`\`\`

## Integration Testing

1. **User Flow:**
   - Login → Dashboard → Generate Pass → Logout

2. **Admin Flow:**
   - Login → View Students → View Logs → Logout

3. **Gate Scan Flow:**
   - Mock POST to `/api/gate/scan` with RFID + PIN
   - Verify movement is logged
   - Verify alert is created

## Known Issues & Workarounds

| Issue | Cause | Workaround |
|-------|-------|-----------|
| QR code not showing | Image loading | Clear cache and refresh |
| Token expired | Session timeout | Login again |
| Realtime not updating | WebSocket disabled | Check browser settings |

## Reporting Bugs

When reporting a bug, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/logs
5. Browser/OS version
6. Environment (dev/prod)

Email: support@qmmust.ac.ke
