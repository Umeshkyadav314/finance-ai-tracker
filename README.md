# Finance AI Tracker (Next.js + TypeScript + MongoDB)

Intelligent finance tracker with Google OAuth, AI-powered natural language transaction parsing, and a beautiful dashboard (Credit Karma / Mint inspired).

## Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Auth: NextAuth with Google OAuth, JWT sessions
- Database: MongoDB (official driver). Prisma schema included for documentation.
- AI: AI SDK + OpenAI (gpt-4o)

## Environment
Copy `.env.example` to Project Settings (or local .env):
\`\`\`
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-long-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=mongodb+srv://USER:PASS@HOST/finance-ai?retryWrites=true&w=majority
OPENAI_API_KEY=your-openai-api-key
\`\`\`

Google OAuth redirect URI (local):
- http://localhost:3000/api/auth/callback/google

## Features
- Google sign-in/out, secure session, per-user data isolation
- Natural language entry → AI parse → confirm → save
- Dashboard: summary cards, category pie, monthly trends line
- Transaction list with search, filters, delete
- Light/Dark toggle (bonus)

## API Endpoints (as required)
Auth (mirrored):
- POST /auth/google → returns sign-in URL (then client redirects)
- POST /auth/refresh → refresh (returns session)
- POST /auth/logout → clear session cookies
- GET /auth/profile → current user

Transactions:
- POST /api/transactions/parse
- POST /api/transactions
- GET /api/transactions (q, category, type, from, to)
- PUT /api/transactions/:id
- DELETE /api/transactions/:id

Analytics:
- GET /api/analytics/summary
- GET /api/analytics/categories
- GET /api/analytics/trends

## Test Data
- "Coffee at Starbucks $6.50"
- "Gas station $40"
- "Amazon purchase $89.99"
- "Monthly salary $4500"
- "Dinner at Italian restaurant $65"
- "Netflix subscription $15.99"
- "Grocery shopping at Whole Foods $120"
- "Uber ride to airport $28"

## UI Notes (Design Guidelines)
- Colors (max 5): primary blue; neutrals (background/foreground); accents emerald (income) and rose (expense)
- Fonts (2): Geist Sans (UI), Geist Mono (code)
- Mobile-first, responsive, no gradients, accessible contrast

## Credits
- shadcn/ui components
- Recharts
- AI SDK + OpenAI
