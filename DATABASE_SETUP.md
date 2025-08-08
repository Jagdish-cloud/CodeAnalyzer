# Database Setup Guide

## Current Status
✅ **Application**: Running with in-memory storage (no database required)  
⚠️ **Database**: Not connected (placeholder configuration)  
📝 **Next Steps**: Install PostgreSQL client and configure connection

## Database Configuration

### Current Settings
- **Database Name**: `School_database`
- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: `root`

### Prerequisites
1. ✅ PostgreSQL server running on localhost:5432
2. ✅ Database `School_database` created
3. ✅ User `postgres` with password `root` has access
4. ✅ Tables created in the database

## Setup Instructions

### Step 1: Install PostgreSQL Client
```bash
npm install pg @types/pg
```

### Step 2: Update Database Connection
Edit `server/database.ts` and replace the placeholder with:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Database connection configuration
const connectionString = 'postgresql://postgres:root@localhost:5432/School_database';

// Create postgres connection
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Export the client for potential direct use
export { client };
```

### Step 3: Enable Database Storage
Edit `server/storage.ts` and uncomment these lines:

```typescript
import { DatabaseStorage } from './databaseStorage';
export const storage = new DatabaseStorage();

// Comment out this line:
// export const storage = new MemStorage();
```

### Step 4: Test Connection
```bash
npm run db:push
```

### Step 5: Restart Application
```bash
npm run dev
```

## Troubleshooting

### Connection Issues
1. **PostgreSQL not running**: Start PostgreSQL service
2. **Wrong credentials**: Verify username/password
3. **Database doesn't exist**: Create database `School_database`
4. **Port blocked**: Check if port 5432 is available

### Package Issues
1. **pg not found**: Run `npm install pg @types/pg`
2. **TypeScript errors**: Restart TypeScript server
3. **Import errors**: Check file paths and imports

## Current Application Status
- ✅ **Frontend**: React application with Vite
- ✅ **Backend**: Express.js API server
- ✅ **Storage**: In-memory storage (working)
- ⚠️ **Database**: Placeholder (needs configuration)

## Benefits of Database Storage
- 🔄 **Persistence**: Data survives application restarts
- 👥 **Multi-user**: Multiple users can access same data
- 📊 **Scalability**: Can handle larger datasets
- 🔒 **Backup**: Data can be backed up and restored

## Fallback Option
If database setup fails, the application will continue to work with in-memory storage. All data will be lost on restart, but the application will function normally. 