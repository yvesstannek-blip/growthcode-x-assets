import { z } from "zod";
import { CompanyUnderstanding } from "./understanding";

export const Goal = z.object({
  metric: z.string().trim().min(1).max(80),
  target: z.number().int().positive(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  current: z.number().int().nonnegative().default(0),
});
export type Goal = z.infer<typeof Goal>;

export const Workspace = z.object({
  url: z.string().min(1),
  understanding: CompanyUnderstanding,
  confirmed: z.boolean(),
  goal: Goal.nullable(),
});
export type Workspace = z.infer<typeof Workspace>;
