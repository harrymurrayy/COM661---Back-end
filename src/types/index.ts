import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  username: string;
  role: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface IJob {
  _id?: string;
  job_title: string;
  seniority_level: string;
  status: string;
  company: string;
  location: string;
  post_date: string;
  headquarter: string;
  industry: string;
  ownership: string;
  company_size: string;
  revenue: string;
  salary: string;
  skills: string;
}
