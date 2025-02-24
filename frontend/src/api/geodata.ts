import { z } from 'zod';
import api from './api';
import { listFilters } from './filters';
import {
  type GeoData,
  geoDataSchema,
  geoDataShortSchema,
  paginatedSchema,
} from './schema';

const paginatedGeoDataShortSchema = paginatedSchema(geoDataShortSchema);
type PaginatedFetch = z.infer<typeof paginatedGeoDataShortSchema>;

export const listGeoData = async (
  filters: listFilters
): Promise<PaginatedFetch> => {
  const response = await api.get('geodata/', { params: filters });
  return paginatedGeoDataShortSchema.parse(response.data);
};

export const createGeoData = async (ip_or_url: string): Promise<GeoData> => {
  const response = await api.post('geodata/', { ip_or_url });
  return geoDataSchema.parse(response.data);
};

export const detailGeoData = async (id: number): Promise<GeoData> => {
  const response = await api.get(`geodata/${id}/`);
  return geoDataSchema.parse(response.data);
};

export const destroyGeoData = async (id: number): Promise<void> => {
  await api.delete(`geodata/${id}/`);
};

export const destroyGeoDataBulk = async (ids: number[]): Promise<void> => {
  await api.post(`geodata/bulk-delete/`, { ids });
};
