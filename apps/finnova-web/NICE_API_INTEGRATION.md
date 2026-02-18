# NICE API Integration - Identity Verification

## Overview
This document describes the NICE/KCB identity verification integration in the Finnova application.

## Setup Instructions

### 1. Environment Variables
Create `.env.local` in `/apps/finnova-web/` with the following variables:

```env
NEXT_PUBLIC_NICE_API_URL=https://nice.checkplus.co.kr
NEXT_PUBLIC_NICE_CLIENT_ID=your_client_id
NEXT_PUBLIC_NICE_CLIENT_SECRET=your_client_secret
```

### 2. Getting NICE API Credentials
1. Visit [NICE](https://www.nice.co.kr)
2. Sign up for CheckPlus service
3. Register your application
4. Get your Client ID and Client Secret from the dashboard
5. Add these credentials to `.env.local`

## Components

### Service: `/src/services/nice.service.ts`
Handles all NICE API communication:

- **`requestNiceVerification(data)`** - Sends verification request to NICE API
  - Parameters: name, phone, birthDate (optional), gender (optional)
  - Returns: token and success status

- **`verifyNiceCode(data)`** - Verifies the code received from NICE
  - Parameters: token, code (6-digit code from SMS)
  - Returns: CI, DI, name, birthDate, gender, phone

- **`isNiceConfigured()`** - Checks if NICE API is properly configured
  - Returns: boolean

### Page: `/src/app/signup/individual/verify/page.tsx`
Identity verification page with two steps:

1. **Step 1 - Request Verification**
   - User enters name and phone number
   - Calls NICE API to request verification code
   - Code is sent via SMS to the phone number

2. **Step 2 - Verify Code**
   - User enters 6-digit code received via SMS
   - Calls NICE API to verify the code
   - On success, stores CI/DI values in sessionStorage
   - Redirects to next signup step

## Data Storage

Verified user data is stored in `sessionStorage` for later use:

- `niceCI` - Unique identifier from NICE
- `niceDI` - Device identifier from NICE
- `verifiedName` - Name verified by NICE
- `verifiedBirthDate` - Birth date verified by NICE
- `verifiedGender` - Gender verified by NICE

## API Flow

```
User Input (Name, Phone)
    ↓
requestNiceVerification()
    ↓
NICE API → SMS Code Sent
    ↓
User Enters Code
    ↓
verifyNiceCode()
    ↓
NICE API → Returns CI/DI
    ↓
Store in sessionStorage
    ↓
Redirect to Next Step
```

## Error Handling

The service handles:
- Network errors
- API validation errors
- Missing configuration
- Code verification failures
- Timeout errors

All errors are logged to console and displayed to the user.

## Security Considerations

1. **Client ID & Secret**: These should be kept secure. In development, use environment variables.
2. **CI/DI Values**: These are stored in sessionStorage (not persistent). For security, transfer them to the backend via encrypted HTTPS connection.
3. **Code Timeout**: Codes expire after 3 minutes.
4. **HTTPS Only**: In production, ensure all communication uses HTTPS.

## Testing

For testing without real NICE API:

1. Comment out the NEXT_PUBLIC_NICE_CLIENT_ID and NEXT_PUBLIC_NICE_CLIENT_SECRET in `.env.local`
2. The `isNiceConfigured()` function will return false
3. UI will display warning that NICE API is not configured
4. Implement mock verification for development/testing

## Troubleshooting

### "NICE API is not configured"
- Ensure `.env.local` has correct NEXT_PUBLIC_NICE_* variables
- Restart the development server after changing env vars
- Check browser console for more details

### "API request failed"
- Verify network connection
- Check NICE API status
- Validate Client ID and Secret
- Check CORS settings if requests are blocked

### "Code verification failed"
- Ensure user enters correct 6-digit code
- Check if code has expired (3-minute limit)
- Try resending code

## Future Enhancements

1. Add rate limiting for verification requests
2. Implement phone number formatting validation
3. Add support for multiple verification methods
4. Implement transaction history tracking
5. Add backend verification webhook integration
6. Support for international phone numbers
