# Environment Setup Guide

To fix the "AI parsing temporarily unavailable" error and enable AI-powered transaction parsing, you need to set up environment variables.

## Step 1: Create .env.local file

Create a file named `.env.local` in your project root directory (same level as package.json).

## Step 2: Add Required Variables

Add the following content to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string

# OpenAI API Key for AI parsing
OPENAI_API_KEY=your-openai-api-key-here
```

## Step 3: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key and paste it as the value for `OPENAI_API_KEY`

## Step 4: Restart Development Server

After creating the `.env.local` file:

```bash
npm run dev
```

## What This Fixes

- ✅ AI-powered transaction parsing will work
- ✅ Natural language input like "Coffee at Starbucks $6.50" will be parsed automatically
- ✅ Transactions will be categorized intelligently
- ✅ Confidence scores will be provided

## Fallback Parser

Even without the OpenAI API key, the app now includes a fallback parser that can:
- Extract amounts from text
- Detect basic categories based on keywords
- Determine if it's income or expense
- Provide basic parsing functionality

## Troubleshooting

If you still see errors:
1. Make sure `.env.local` file is in the project root
2. Verify all environment variables are set correctly
3. Restart your development server
4. Check that the OpenAI API key is valid and has credits

## Security Note

Never commit your `.env.local` file to version control. It's already added to `.gitignore` to prevent accidental commits.
