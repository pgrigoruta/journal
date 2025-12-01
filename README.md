# Journal

A Next.js journal application with Supabase, Prisma, and Vitest.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require
     ```
   - You can find your Supabase database connection string in your Supabase project settings under Database > Connection string

3. Generate Prisma Client:
```bash
npm run db:generate
```

4. (Optional) Push your schema to the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Prisma Commands

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Run database seed script

## Testing

Run tests with Vitest:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## Deployment

This project is configured for Vercel deployment. Simply connect your repository to Vercel and it will automatically deploy.

Make sure to set all environment variables in your Vercel project settings.

