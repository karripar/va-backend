import express, {Request, Response} from 'express';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Auth API v1 - Routes: /auth, /users',
  })
}
);

router.use('/auth', authRoute);
router.use('/users', userRoute);

export default router;
