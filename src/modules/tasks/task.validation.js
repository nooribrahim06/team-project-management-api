import { z } from "zod";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const titleSchema = z.string().trim().min(1).max(200);
const descriptionSchema = z.string().trim().min(1).max(2000);
const assignedToIdSchema = z.string().uuid().nullable().optional();

export const createTaskSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    assignedToId: assignedToIdSchema,
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    assignedToId: assignedToIdSchema,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const projectIdParamSchema = z
  .object({
    projectId: z.string().uuid(),
  })
  .strict();

export const taskIdParamSchema = z
  .object({
    projectId: z.string().uuid(),
    taskId: z.string().uuid(),
  })
  .strict();
