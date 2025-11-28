import express, {Request, Response} from 'express';
import testRoute from './routes/testRoute';
import storyPhotoRoute from './routes/storyPhotoRoute';
import fileRoute from './routes/fileRoute';
import linkUploadRoute from './routes/linkUploadRoute';
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: /test, upload, delete, list',
  });
});

router.use('/test', testRoute);
router.use('/upload', storyPhotoRoute);
router.use('/uploads', fileRoute);
router.use('/linkUploads', linkUploadRoute);

export default router;
