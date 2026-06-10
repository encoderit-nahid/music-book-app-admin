import { z } from "zod";

export const MetaSchema = z.object({
  first_page_url: z.string().nullable(),
  prev_page_url: z.string().nullable(),
  next_page_url: z.string().nullable(),
  last_page_url: z.string().nullable(),
  path: z.string(),
  current_page: z.number(),
  last_page: z.number(),
  from: z.number(), 
  to: z.number(),  
  per_page: z.number(),
  total: z.number(),
});

export type TMetaSchema = z.infer<typeof MetaSchema>;