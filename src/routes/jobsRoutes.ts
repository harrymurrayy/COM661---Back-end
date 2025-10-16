import { Router } from "express";
import { body, param } from "express-validator";
import * as jobsController from "../controllers/jobsController";
import { validate } from "../middleware/validator";
import { authenticate, authorizeAdmin } from "../middleware/auth";

const router = Router();

// Get all jobs (public, with pagination and search)
router.get("/", jobsController.getAllJobs);

// Get single job by ID (public)
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid job ID"), validate],
  jobsController.getJobById
);

// Create new job (requires authentication)
router.post(
  "/",
  authenticate,
  [
    body("job_title").trim().notEmpty().withMessage("Job title is required"),
    body("company").trim().notEmpty().withMessage("Company is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    validate,
  ],
  jobsController.createJob
);

// Update job (requires admin)
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  [param("id").isMongoId().withMessage("Invalid job ID"), validate],
  jobsController.updateJob
);

// Delete job (requires admin)
router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  [param("id").isMongoId().withMessage("Invalid job ID"), validate],
  jobsController.deleteJob
);

export default router;
