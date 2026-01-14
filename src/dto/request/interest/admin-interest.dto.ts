import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Category
export const createCategorySchema = z.object({
  name: z.string().trim()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(30, "Category name must be less than 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
});

export const updateCategorySchema = z.object({
  name: z.string().trim()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(30, "Category name must be less than 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
});

export const setActiveSchema = z.object({
  isActive: z.boolean(),
});

// Interest
export const createInterestSchema = z.object({
  name: z.string().trim()
    .min(1, "Interest name is required")
    .min(2, "Interest name must be at least 2 characters")
    .max(30, "Interest name must be less than 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
  categoryId: z.string().min(1, "Category ID is required"),
});

export const updateInterestSchema = z.object({
  name: z.string().trim()
    .min(1, "Interest name is required")
    .min(2, "Interest name must be at least 2 characters")
    .max(30, "Interest name must be less than 30 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
});
