import * as z from "zod";

export const FormSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(50, "Password is too long"),
  password_confirmation: z
    .string()
    .min(6, "Password confirmation must be at least 6 characters long"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});
export type TFormSchema = z.infer<typeof FormSchema>;
