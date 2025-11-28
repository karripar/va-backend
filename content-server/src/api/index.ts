import express, {Request, Response} from 'express';
import destinationRoute from './routes/destinationRoute';
import contactRoute from './routes/contactRoute';
import exchangeStoriesRoute from './routes/ExchangeStoriesRoute';
import storyRoute from './routes/storyRoute';
import instructionRoute from './routes/instructionRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: /destinations, /contact, /instructions',
  });
});

router.use('/destinations', destinationRoute);
router.use('/contact', contactRoute);
router.use('/exchange-stories', exchangeStoriesRoute);
router.use('/stories', storyRoute);
router.use('/instructions', instructionRoute);

export default router;

