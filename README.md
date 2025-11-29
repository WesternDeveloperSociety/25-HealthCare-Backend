# 25-HealthCare Backend

Backend API for WDS Healthcare project 2025, built with Express.js, TypeScript, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Testing**: Vitest
- **Code Formatting**: Prettier

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher recommended)
- **Docker** and **Docker Compose** (for local PostgreSQL database)
- **npm** (comes with Node.js)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env` file contains:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### 3. Start the Database

Start PostgreSQL using Docker Compose:

```bash
npm run docker:up
```

This will:
- Pull the PostgreSQL 16 image (if not already downloaded)
- Start a container named `healthcare-postgres`
- Create a persistent volume for data
- Expose the database on `localhost:5432`

### 4. Set Up the Database Schema

Push the Prisma schema to create tables:

```bash
npm run db:push
```

Or create a migration (recommended for production):

```bash
npm run db:migrate
```

### 5. Generate Prisma Client

Generate the Prisma Client (usually done automatically, but can be run manually):

```bash
npm run db:generate
```

### 6. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)

### Database

- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and apply a migration
- `npm run db:migrate:deploy` - Deploy migrations (production)
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Run database seed script

### Docker

- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run docker:logs` - View PostgreSQL logs

### Testing

- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality

- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check code formatting without changes

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── lib/             # Shared utilities
│   │   └── prisma.ts    # Prisma client instance
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── docker-compose.yml   # PostgreSQL container configuration
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## Database Management

### Using Prisma Studio

Prisma Studio provides a visual interface to view and edit your database:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555`.

### Making Schema Changes

1. **Edit** `prisma/schema.prisma`
2. **Push changes** (development):
   ```bash
   npm run db:push
   ```
3. **Or create a migration** (recommended):
   ```bash
   npm run db:migrate
   ```
   This creates a migration file in `prisma/migrations/` for version control.

### Using Prisma in Your Code

```typescript
import { prisma } from './lib/prisma.js';

// Example: Get all users
const users = await prisma.user.findMany();

// Example: Create a user
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});
```

## API Routes

The API is organized by resource:

- `/api/users` - User management
- `/api/appointments` - Appointment management
- `/api/documents` - Document management

## Development Workflow

1. **Start the database** (if not already running):
   ```bash
   npm run docker:up
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Make changes** to your code

4. **Test your changes**:
   ```bash
   npm test
   ```

5. **Format your code** before committing:
   ```bash
   npm run format
   ```

## Contributing

### Branch Naming

Create branches off of `dev` using the format: `<name>/type-title-of-this-branch`

Valid types:
- `feat`: New feature
- `fix`: Bug fix
- `refact`: Refactor
- `docs`: Documentation
- `chore`: Maintenance task

### Pull Request Process

1. Create a branch from `dev`
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Open a pull request to `dev`

## Branches

- `dev` - Development branch (where contributions are made)
- `qa` - Quality assurance branch (functional version for testing)
- `prod` - Production branch (production-ready code)

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:

1. **Check if the container is running**:
   ```bash
   docker-compose ps
   ```

2. **View database logs**:
   ```bash
   npm run docker:logs
   ```

3. **Restart the database**:
   ```bash
   npm run docker:down
   npm run docker:up
   ```

### Prisma Client Not Found

If you get errors about Prisma Client:

```bash
npm run db:generate
```

### Port Already in Use

If port 3000 is already in use, change the `PORT` in your `.env` file.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |

## License

ISC
