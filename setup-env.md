# Environment Setup Instructions

To fix the NextAuth CLIENT_FETCH_ERROR, you need to create a `.env.local` file in your project root with the following variables:

## Required Environment Variables

Create a file named `.env.local` in your project root directory with the following content:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
```

## How to get these values:

### 1. NEXTAUTH_SECRET
Generate a random secret key. You can use:
```bash
openssl rand -base64 32
```
Or visit: https://generate-secret.vercel.app/32

### 2. Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs to: `http://localhost:3000/api/auth/callback/google`

### 3. MongoDB URI
- For local MongoDB: `mongodb://localhost:27017/finance-tracker`
- For MongoDB Atlas: Get connection string from your cluster

## After setting up the environment variables:

1. Restart your development server: `npm run dev`
2. The NextAuth error should be resolved

## Troubleshooting

If you still get errors:
- Make sure all environment variables are set
- Check that your Google OAuth redirect URI matches exactly
- Verify MongoDB connection string is correct
- Clear browser cache and cookies
