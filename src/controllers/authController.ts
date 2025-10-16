import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "../config/database";
import { AuthRequest } from "../types";
import { AppError } from "../middleware/errorHandler";

const USERS_COLLECTION = "users";

export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    const db = Database.getInstance().getDb();
    const usersCollection = db.collection(USERS_COLLECTION);

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      username,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("JWT secret not configured", 500);
    }

    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email,
        role: "user",
      },
      secret,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: result.insertedId.toString(),
          email,
          username,
          role: "user",
        },
        token,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const db = Database.getInstance().getDb();
    const usersCollection = db.collection(USERS_COLLECTION);

    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError("JWT secret not configured", 500);
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    const db = Database.getInstance().getDb();
    const usersCollection = db.collection(USERS_COLLECTION);

    const user = await usersCollection.findOne(
      { email: req.user.email },
      { projection: { password: 0 } }
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    throw error;
  }
};
