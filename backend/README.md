# Hono D1 Drizzle Template

A modern template for building REST APIs using Hono.js, Cloudflare D1, and Drizzle ORM. This template provides a robust foundation for building scalable applications on Cloudflare's edge network.

## Features

- 🚀 [Hono.js](https://hono.dev/) - Fast, Lightweight, Web-standards Web Framework
- 📦 [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM with great developer experience
- 🗄️ [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite database at the edge
- 🔧 Type-safe database operations
- 🛠️ Built-in migration and seeding tools
- 🌐 Edge-ready API endpoints

## Prerequisites

- Node.js (v18 or later recommended)
- pnpm (package manager)
- Cloudflare account with Workers subscription
- Wrangler CLI installed globally

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up configuration files:

   ```bash
   # Copy environment variables template
   cp .env.local.example .env.local

   # Copy Wrangler configuration template
   cp wrangler.json.example wrangler.json
   ```

4. Initialize your D1 databases:

   ```bash
   # Create production database
   wrangler d1 create your-database-name

   # Create preview database
   wrangler d1 create your-database-name-preview
   ```

5. Update the configuration files:
   - Fill in your Cloudflare credentials in `.env.local`
   - Update database IDs in `wrangler.json`

## Environment Setup

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
CLOUDFLARE_API_TOKEN="your_api_token"
CLOUDFLARE_ACCOUNT_ID="your_account_id"
CLOUDFLARE_DATABASE_ID_PRODUCTION="your_production_db_id"
CLOUDFLARE_DATABASE_ID_PREVIEW="your_preview_db_id"
ENVIRONMENT="preview|production"
```

### 2. Wrangler Configuration

The `wrangler.json` file needs to be configured with your database IDs:

```json
{
  "d1_databases": [
    {
      "binding": "DB_PROD",
      "database_name": "your-database-name",
      "database_id": "your_production_db_id",
      "preview_database_id": "your_preview_db_id"
    }
  ]
}
```

### 3. Database Environments

This template supports two database environments:

- **Preview**: For development and testing
- **Production**: For production deployment

The database environment is controlled by the `ENVIRONMENT` variable in `.env.local`.

## Database Management

This template uses Drizzle ORM with separate migration handling for preview and production environments:

```bash
# Set environment in .env.local first (preview or production)
ENVIRONMENT=preview|production

# Generate migrations (will be created in src/db/migrations/preview or production)
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio for database visualization
pnpm db:studio

# Generate seed data
pnpm generate:seed

# Seed the preview database
pnpm db:seed:preview
```

### Migration Directories

The migrations are stored in separate directories based on the environment:

```
src/db/migrations/
├── preview/     # Preview environment migrations
└── production/  # Production environment migrations
```

### Drizzle Configuration

The `drizzle.config.ts` file manages:

- Environment-specific database connections
- Migration output directories
- Database credentials and authentication
- Schema location and validation

## Development

Start the development server:

```bash
pnpm dev
```

## Deployment

Deploy to Cloudflare Workers:

```bash
pnpm deploy
```

## Project Structure

```
├── src/
│   ├── index.ts        # Main application entry
│   └── db/            # Database related files
│       ├── schema.ts   # Drizzle schema definitions
│       └── migrations/ # Database migrations
├── drizzle.config.ts   # Drizzle configuration
├── wrangler.json       # Cloudflare Workers configuration
└── package.json        # Project dependencies
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
CLOUDFLARE_API_TOKEN="your_api_token"
CLOUDFLARE_ACCOUNT_ID="your_account_id"
CLOUDFLARE_DATABASE_ID_PRODUCTION="your_production_db_id"
CLOUDFLARE_DATABASE_ID_PREVIEW="your_preview_db_id"
ENVIRONMENT="preview|production"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this template for your own projects.
