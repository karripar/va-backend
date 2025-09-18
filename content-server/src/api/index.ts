import express, {Request, Response} from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: users, auth',
  })
}
);

// router.use('/users', userRoute); import users route when available
// router.use('/auth', authRoute); import auth route when available

export default router;
