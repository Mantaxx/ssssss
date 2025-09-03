import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import racesRouter from './routes/races';
import weatherRouter from './routes/weather';
import aiRouter from './routes/ai';
import eskRouter from './routes/esk';
import analysisRouter from './routes/analysis';
import forecastRouter from './routes/forecast';
import exportRouter from './routes/export';
import loftsRouter from './routes/lofts';
import { connectPrisma, disconnectPrisma } from './db/prisma';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API gateway placeholder: /api/weather/forecast
app.get('/api/weather/forecast', (req: Request, res: Response) => {
  const { lat, lon, altitudes } = req.query;
  res.json({ lat, lon, altitudes, data: [] });
});

app.use('/api/races', racesRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/ai', aiRouter);
app.use('/api/esk', eskRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/export', exportRouter);
app.use('/api/lofts', loftsRouter);

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: { message: err.message, code: 'INTERNAL_ERROR' } });
});

const port = process.env.PORT || 4000;

async function start() {
  await connectPrisma();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`backend listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await disconnectPrisma();
  process.exit(0);
});
