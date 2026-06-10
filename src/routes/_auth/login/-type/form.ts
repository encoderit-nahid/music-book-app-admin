import * as z from "zod";

export const FormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password is too long"),
  type: z.literal("admin"),
});
export type TFormSchema = z.infer<typeof FormSchema>;
