import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController";
import { validate } from "../middleware/validator";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    validate,
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authController.login
);

router.get("/profile", authenticate, authController.getProfile);

export default router;
