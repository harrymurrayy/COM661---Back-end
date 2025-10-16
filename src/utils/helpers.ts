import { Request } from "express";
import { PaginationParams } from "../types";

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number
): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

export const createPaginationResponse = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
) => {
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: calculateTotalPages(totalItems, limit),
      totalItems,
      itemsPerPage: limit,
    },
  };
};

export const sanitizeUser = (user: any) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
