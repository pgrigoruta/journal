# Journal

A Next.js journal application with Neon (PostgreSQL), Prisma, and Vitest.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Neon database connection string:
     ```
     DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
     ```
   - You can find your Neon connection string in your Neon project dashboard under "Connection Details"
   - Neon connection strings typically look like:
     ```
     postgresql://[user]:[password]@[project].neon.tech/[database]?sslmode=require
     ```

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

## Database (Neon)

This project uses [Neon](https://neon.tech) as the PostgreSQL database provider. Neon is a serverless Postgres database that works seamlessly with Prisma.

### Setting up Neon

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string from the Neon dashboard
4. Add it to your `.env.local` file as `DATABASE_URL`

The connection string format is:
```
postgresql://[user]:[password]@[project].neon.tech/[database]?sslmode=require
```

### Running Migrations

After setting up your Neon database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create a migration (for production)
npm run db:migrate
```

## Deployment

This project is configured for Vercel deployment. Simply connect your repository to Vercel and it will automatically deploy.

Make sure to set the `DATABASE_URL` environment variable in your Vercel project settings with your Neon connection string.

