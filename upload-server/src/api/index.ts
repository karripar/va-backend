import express, {Request, Response} from 'express';
import testRoute from './routes/testRoute';
import storyPhotoRoute from './routes/storyPhotoRoute';
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: /test, /upload',
  })
}
);

router.use('/test', testRoute);
router.use('/upload', storyPhotoRoute);

export default router;
