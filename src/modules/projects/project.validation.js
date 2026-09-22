import { z } from "zod";

const projectFields = {
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).nullable().optional(),
};

export const createProjectSchema = z.object(projectFields).strict();

export const updateProjectSchema = z
  .object({
    name: projectFields.name.optional(),
    description: projectFields.description,
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
