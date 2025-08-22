import { z } from "zod";
import { BillingType, ProjectStatus } from "../models/project";


export const ProjectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 chars"),
  billingType: z.nativeEnum(BillingType),
  creationDate: z.string().datetime("Invalid date format (use ISO string)"),
  status: z.nativeEnum(ProjectStatus),
  teamMember: z.number().optional(),
  resources: z.array(z.string()).optional(),
  isDeleted: z.boolean().optional().default(false),
});

export const ResourceSchema = z.object({
  empCode: z.string(),
  name: z.string(),
  department: z.string(),
  designation: z.string(),
  allocatedHours: z.number().min(1, "Hours must be at least 1"),
  allocatedFrom: z.string().datetime(),
  allocatedtill: z.string().datetime(),
  hoursLogged: z.number().min(0),
  experience: z.number().min(0),
  isDeleted: z.boolean().default(false),
});
