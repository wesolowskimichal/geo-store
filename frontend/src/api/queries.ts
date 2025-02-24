import { queryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { detailGeoData, listGeoData } from './geodata';
import { listFilters } from './filters';

export const useListQuery = (filters: listFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['list', filters],
    queryFn: async ({ pageParam = 1 }) => {
      return listGeoData({ ...filters, page: pageParam });
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.last_page
        ? lastPage.meta.page + 1
        : undefined,
    initialPageParam: 1,
  });
};

export const detailQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['detail', id],
    queryFn: () => detailGeoData(id),
  });
