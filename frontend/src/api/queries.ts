import { queryOptions } from '@tanstack/react-query';
import {
  createGeoData,
  destroyGeoData,
  detailGeoData,
  listGeoData,
} from './geodata';

export const listQueryOptions = queryOptions({
  queryKey: ['list'],
  queryFn: () => listGeoData(),
});

export const createQueryOptions = (ip_or_url: string) =>
  queryOptions({
    queryKey: ['create'],
    queryFn: () => createGeoData(ip_or_url),
  });

export const detailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['detail', id],
    queryFn: () => detailGeoData(id),
  });

export const destroyQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['destroy', id],
    queryFn: () => destroyGeoData(id),
  });
