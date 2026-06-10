import * as z from "zod";

export const FormSchema = z.object({
  email: z.email("Please enter a valid email address"),
});
export type TFormSchema = z.infer<typeof FormSchema>;
