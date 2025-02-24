import { listFilters } from '@/api/filters';
import { useListQuery } from '@/api/queries';
import { useEffect, useRef, useState } from 'react';

type filters = Omit<listFilters, 'page'>;

export const useList = (filters: filters = {}) => {
  const [_filters, setFilters] = useState({ ...filters, page: 1 });
  const query = useListQuery(_filters);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    query;
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  const mergedData = data ? data.pages.flatMap((page) => page.data) : [];

  const handleFilterChange = (newFilters: filters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const nextPage = () => {
    if (!isFetchingNextPage && !isLoading && hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isFetchingNextPage &&
          hasNextPage &&
          !isLoading
        ) {
          fetchNextPage();
        }
      },
      {
        root: null,
        threshold: 0.2,
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, isLoading, isFetchingNextPage]);

  return {
    pagination: {
      sentinelRef,
      nextPage,
    },
    filters: {
      filters: _filters,
      setFilters: handleFilterChange,
    },
    query: {
      ...query,
      data: { data: mergedData, meta: data?.pages[0]?.meta },
    },
  };
};

// import { listFilters } from '@/api/filters';
// import { useListQuery } from '@/api/queries';
// import { useState } from 'react';

// type filters = Omit<listFilters, 'page'>;

// export const useList = (filters: filters = {}) => {
//   const [_filters, setFilters] = useState({ ...filters, page: 1 });
//   const query = useListQuery(_filters);
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
//     query;

//   const mergedData = data ? data.pages.flatMap((page) => page.data) : [];

//   const handleFilterChange = (newFilters: filters) => {
//     setFilters({ ...newFilters, page: 1 });
//   };

//   const nextPage = () => {
//     if (!isFetchingNextPage && !isLoading && hasNextPage) {
//       fetchNextPage();
//     }
//   };

//   return {
//     pagination: {
//       nextPage,
//     },
//     filters: {
//       filters: _filters,
//       setFilters: handleFilterChange,
//     },
//     query: {
//       ...query,
//       data: { data: mergedData, meta: data?.pages[0]?.meta },
//     },
//   };
// };
