import { z } from "zod";

export const SearchSchema = z.object({
  page: z.number().catch(1),
  per_page: z.number().catch(5),
  search: z.string().optional().catch(""),

});
export type TSearchSchema = z.infer<typeof SearchSchema>;
