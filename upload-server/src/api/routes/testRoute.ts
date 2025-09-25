import express from "express";
import { body } from "express-validator";
const router = express.Router();
import { validationErrors } from "../../middlewares";

router.post(
  "/test",
  body("message").isString().withMessage("Message must be a string"),
  validationErrors,
  (req, res) => {
    const { message } = req.body;
    res.status(200).json({ message: `Received: ${message}` });
  }
);

export default router;
