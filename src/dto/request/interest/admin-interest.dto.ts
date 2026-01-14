import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Category
export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
});

export const setActiveSchema = z.object({
  isActive: z.boolean(),
});

// Interest
export const createInterestSchema = z.object({
  name: z.string().min(2, "Interest name is required"),
  categoryId: z.string().min(1, "Category ID is required"),
});

export const updateInterestSchema = z.object({
  name: z.string().min(2, "Interest name is required"),
});
