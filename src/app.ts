import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import imageRoutes from './routes/image.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), { dotfiles: 'ignore' }));

app.use('/api/images', imageRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null
  });
});

app.use(errorHandler);

export default app;
