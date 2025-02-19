import api from './api';
import {
  type GeoData,
  geoDataSchema,
  type GeoDataShort,
  geoDataShortSchema,
} from './schema';

export const listGeoData = async (): Promise<GeoDataShort[]> => {
  const response = await api.get('geodata/');
  return geoDataShortSchema.array().parse(response.data);
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
