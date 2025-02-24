import z, { ZodTypeAny } from 'zod';

export const geoDataShortSchema = z.object({
  id: z.number(),
  ip_or_url: z.string(),
  type: z.string(),
  country_name: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  country_flag_emoji_unicode: z.string(),
  status: z.enum(['SUCCESS', 'FAILED']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export const geoDataSchema = geoDataShortSchema.extend({
  raw_response: z.object({}).passthrough().nullable(),
});

export const paginatedSchema = <T extends ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: itemSchema.array(),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      last_page: z.number(),
    }),
  });

export type GeoDataShort = z.infer<typeof geoDataShortSchema>;
export type GeoData = z.infer<typeof geoDataSchema>;
