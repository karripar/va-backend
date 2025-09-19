import express, {Request, Response} from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: nothing yet',
  })
}
);

// router.use('/favorites', favoritesRouter); // Example of how to add more routes in the future

export default router;
