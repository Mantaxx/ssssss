# columba

Platforma wyścigów gołębi oparta na sztucznej inteligencji z analizą pogody i wizualizacją 3D.

## Architektura

- **backend**: Node.js + TypeScript + Express + Prisma
- **db**: PostgreSQL + PostGIS, Redis (docker-compose)
- **frontend**: React + Vite + Tailwind + Mapbox GL JS
- **ai-service**: FastAPI dla predykcji pogodowych

## API Endpoints

### Backend (port 4000)
- `GET /health` - health check
- `GET /api/weather/forecast?lat=...&lon=...&hours=...` - prognoza pogody Open-Meteo
- `GET /api/races/competition-list?total=...&strategy=standard|gmp` - lista konkursowa
- `GET /api/races/competition-list/:raceId?strategy=...` - lista dla konkretnego wyścigu
- `POST /api/ai/predict` - predykcja AI (przekierowanie do mikroserwisu)
- `POST /api/esk/parse` - parser zegarów ESK (Tipes, Benzing)
- `POST /api/esk/detect-system` - wykrywanie systemu ESK
- `GET /api/analysis/pigeon/:pigeonId/history` - analiza historyczna gołębia
- `GET /api/analysis/pigeon/:pigeonId/profile` - profil wydajności gołębia
- `POST /api/forecast/summary` - podsumowanie prognozy AI
- `GET /api/export/competition-list/:raceId?format=csv|pdf` - eksport list konkursowych

### AI Service (port 8001)
- `GET /health` - health check
- `POST /predict` - predykcja bezpieczeństwa i wydajności lotu

## Development

1. **Start services**
```bash
docker compose up -d db redis
```

2. **Backend setup**
```bash
cd backend
npm i
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

3. **Frontend setup**
```bash
cd frontend
npm i
npm run dev
```

4. **AI service setup**
```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

5. **Tests**
```bash
cd backend
npm test
```

## Environment Variables

Create `.env` file:
```
# Backend
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/columba
REDIS_URL=redis://localhost:6379

# Frontend
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```
