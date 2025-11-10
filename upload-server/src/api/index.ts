import express, {Request, Response} from 'express';
import fileRoute from './routes/fileRoute';
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'routes: upload, delete, list',
  });
});

router.use('/uploads', fileRoute);

export default router;
