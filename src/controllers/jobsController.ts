import { Response } from "express";
import { ObjectId } from "mongodb";
import Database from "../config/database";
import { AuthRequest } from "../types";
import { AppError } from "../middleware/errorHandler";
import {
  getPaginationParams,
  createPaginationResponse,
} from "../utils/helpers";

const JOBS_COLLECTION = "jobs";

// Get all jobs with pagination and search
export const getAllJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const db = Database.getInstance().getDb();
    const collection = db.collection(JOBS_COLLECTION);

    const { page, limit, skip } = getPaginationParams(req);

    // Search functionality
    const searchQuery = req.query.search as string;
    const filter: any = {};

    if (searchQuery) {
      filter.$or = [
        { job_title: { $regex: searchQuery, $options: "i" } },
        { company: { $regex: searchQuery, $options: "i" } },
        { location: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalItems = await collection.countDocuments(filter);
    const jobs = await collection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    const response = createPaginationResponse(jobs, totalItems, page, limit);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error) {
    throw error;
  }
};

// Get single job by ID
export const getJobById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid job ID", 400);
    }

    const db = Database.getInstance().getDb();
    const collection = db.collection(JOBS_COLLECTION);

    const job = await collection.findOne({ _id: new ObjectId(id) });

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    throw error;
  }
};

// Create new job (requires authentication)
export const createJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    const db = Database.getInstance().getDb();
    const collection = db.collection(JOBS_COLLECTION);

    const newJob = {
      ...req.body,
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newJob);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: {
        _id: result.insertedId,
        ...newJob,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Update job (requires admin)
export const updateJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid job ID", 400);
    }

    const db = Database.getInstance().getDb();
    const collection = db.collection(JOBS_COLLECTION);

    const updateFields: any = { ...req.body, updatedAt: new Date() };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new AppError("Job not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

// Delete job (requires admin)
export const deleteJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid job ID", 400);
    }

    const db = Database.getInstance().getDb();
    const collection = db.collection(JOBS_COLLECTION);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new AppError("Job not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    throw error;
  }
};
