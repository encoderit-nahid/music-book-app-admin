
import { z } from "zod";
export type TFormType =
  | "default"
  | "create"
  | "read"
  | "update"
  | "delete"
  | "create-assign-job"
  | "update-assign-job"
  | "view-assign-job"
  | "view-incident"
  | "view-live-service"
  | "view-complete"
  | "incomplete"
  | "view-incomplete"
  | "alert";
export type TForm = {
  type: TFormType;
  title: string;
  description: string;
  id?: string | number;
  
};

//ZOD

export const OptionSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  name: z.string().optional(),
  Title:z.string().optional(),
  label: z.string().optional(),
  value: z.string().optional(),
});
export type OptionSchemaType = z.infer<typeof OptionSchema>;