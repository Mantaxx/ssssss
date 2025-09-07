# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Columba is an AI-powered pigeon racing platform with weather analysis and 3D visualization. The system manages pigeon racing competitions with intelligent predictions and comprehensive data analytics.

**Core Domains:**
- **Racing Management**: Competition lists, results, timing systems (ESK parsers for Tipes/Benzing)
- **Geographic Intelligence**: PostGIS-powered spatial analysis, release points, loft locations  
- **Weather Integration**: Open-Meteo API integration, 3D weather visualization
- **AI Predictions**: Flight safety and performance forecasting
- **Data Import/Export**: CSV/PDF export, ESK timing system parsing

## Architecture

**Multi-service architecture:**
- **backend/**: Node.js + TypeScript + Express + Prisma ORM
- **frontend/**: React + Vite + Tailwind CSS + Mapbox GL JS
- **ai-service/**: FastAPI Python service for ML predictions
- **db/**: PostgreSQL with PostGIS extension, Redis for caching

**Key Technologies:**
- Database: PostgreSQL + PostGIS for geospatial data, Prisma for ORM
- Frontend: React with Mapbox GL JS for 3D mapping and visualization
- Backend: Express with modular routing (races, weather, AI, analysis, export)
- AI Service: FastAPI with pydantic models for predictions

## Development Commands

### Initial Setup
```bash
# Start database and Redis
docker compose up -d db redis

# Backend setup
cd backend
npm i
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev

# Frontend setup  
cd frontend
npm i
npm run dev

# AI service setup
cd ai-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Common Development Tasks

**Backend Development:**
```bash
cd backend
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run lint             # ESLint code checking
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run prisma:generate  # Generate Prisma client
npm run prisma:seed      # Seed database with test data
```

**Frontend Development:**
```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

**AI Service Development:**
```bash
cd ai-service
uvicorn main:app --reload --port 8001  # Start with hot reload
```

**Database Operations:**
```bash
cd backend
npm run prisma:migrate:dev --name <migration_name>  # Create and apply migration
npx prisma studio                                   # Open Prisma Studio GUI
```

**Testing:**
```bash
cd backend
npm test                         # Run all tests
npm run test:watch              # Watch mode
npm test -- --testPathPattern=specific.test.ts  # Run specific test file
```

## Code Architecture & Patterns

### Backend Structure
- **Routes** (`src/routes/`): Thin controllers that delegate to services
- **Services** (`src/services/`): Business logic layer 
- **Models**: Prisma-generated from `prisma/schema.prisma`
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Structured JSON error responses: `{ "error": { "message": "...", "code": "..." } }`

### Key Data Models (Prisma)
- **Fancier**: Pigeon owners with PZHGP IDs
- **Loft**: Geospatial loft locations with PostGIS
- **Pigeon**: Complete lineage tracking (sire/dam relationships)
- **Race**: Competitions with release points and timing
- **Result**: Individual pigeon performance in races
- **ReleasePoint**: Official PZHGP release locations

### Frontend Architecture
- **React + TypeScript** with Vite build system
- **Mapbox GL JS** for 3D visualization and mapping
- **Proxy setup**: `/api/*` requests forwarded to backend (port 4000)
- **Tailwind CSS** for styling

### AI Service
- **FastAPI** with Pydantic models for type safety
- **Prediction models**: Return probability and speed delta calculations
- **Health check** endpoint for service monitoring

## API Endpoints

### Backend (port 4000)
- `GET /health` - Service health check
- `GET /api/weather/forecast?lat=...&lon=...&hours=...` - Weather forecast (Open-Meteo)
- `GET /api/races/competition-list?total=...&strategy=standard|gmp` - Competition list generation
- `GET /api/races/competition-list/:raceId?strategy=...` - Race-specific competition list
- `POST /api/ai/predict` - AI predictions (proxied to ai-service)
- `POST /api/esk/parse` - Parse ESK timing files (Tipes, Benzing)
- `POST /api/esk/detect-system` - Detect ESK timing system
- `GET /api/analysis/pigeon/:pigeonId/history` - Historical pigeon analysis
- `GET /api/analysis/pigeon/:pigeonId/profile` - Pigeon performance profile
- `POST /api/forecast/summary` - AI-powered forecast summary
- `GET /api/export/competition-list/:raceId?format=csv|pdf` - Export competition lists

### AI Service (port 8001)
- `GET /health` - Health check
- `POST /predict` - Flight safety and performance predictions

## Development Standards

### API Development
- Use **Zod** for all request validation (body, params, query)
- Business logic must be in services (`src/services/`), keep controllers thin
- Use **Prisma** for all PostgreSQL interactions
- Return structured errors: `{ "error": { "message": "...", "code": "..." } }`

### Database
- **PostGIS** for all spatial operations (loft locations, release points)
- **Prisma migrations** for schema changes
- Seed data available via `npm run prisma:seed`

### Testing
- **Jest** with ts-jest preset for backend testing
- Tests in `src/**/__tests__/**/*.test.ts`
- Coverage collection from `src/**/*.ts` (excluding `.d.ts`)

## Environment Configuration

Required `.env` variables:
```
# Backend
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/columba  
REDIS_URL=redis://localhost:6379
```

## Polish Racing Context

This system implements **PZHGP** (Polish Association of Racing Pigeons) standards:
- Competition categories and scoring systems
- Official release point data
- GMP (General Merit Points) calculation strategies
- ESK timing system integration (Tipes, Benzing brands)
