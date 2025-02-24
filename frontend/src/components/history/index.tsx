import { ScrollArea } from '../ui/scroll-area';
import { useList } from '@/hooks/use-list';
import { useMemo, useState } from 'react';
import { DataTable } from '../data-table';
import { columns } from './columns';
import { RowSelectionState } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { destroyGeoDataBulk } from '@/api/geodata';
import { toast } from 'sonner';
import { isApiDetailedError } from '@/api/api';
import { Link } from '@tanstack/react-router';

export const History = () => {
  const queryClient = useQueryClient();
  const destroyMutation = useMutation({
    mutationFn: (ids: number[]) => destroyGeoDataBulk(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list'] });
      toast.success('Data deleted successfully');
    },
    onError: (error: unknown) => {
      if (isApiDetailedError(error)) {
        toast.error(
          error.response?.data.detail ?? 'An unexpected error occurred'
        );
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
  const {
    filters: filtersObj,
    pagination,
    query,
  } = useList({
    page_size: 30,
  });
  const { data, isLoading, hasNextPage } = query;
  const { sentinelRef } = pagination;
  const { filters, setFilters } = filtersObj;
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useMemo(
    () => (
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        isRowDisabled={(row) => row.status === 'FAILED'}
        options={{
          getRowId: (row) => String(row.id),
          onRowSelectionChange: setRowSelection,
          manualPagination: true,
          enableRowSelection: true,
          state: {
            rowSelection,
          },
        }}
        className="h-screen"
        parentClassName="h-full"
        isFooter={hasNextPage}
        footerRef={sentinelRef}
      />
    ),
    [columns, data, rowSelection, sentinelRef]
  );

  return (
    <div className="mt-8 flex h-full flex-1 flex-col gap-4 border-t pb-2 pt-8">
      <div className="flex items-end justify-between">
        <h2 className="font-medium">History</h2>
        <div className="flex flex-col items-end gap-2">
          <Input
            type="text"
            placeholder="Address..."
            value={filters.ip_or_url__icontains ?? ''}
            onChange={(e) =>
              setFilters({ ...filters, ip_or_url__icontains: e.target.value })
            }
          />
          <div className="flex gap-4">
            {Object.keys(rowSelection).map(Number).length === 1 && (
              <Link
                to="/$id"
                className="h-fit rounded-none border-b p-0 text-xs"
                params={{
                  id: Object.keys(rowSelection).map(Number)[0].toString(),
                }}
              >
                details
              </Link>
            )}
            {Object.keys(rowSelection).map(Number).length > 0 && (
              <Button
                variant="link"
                className="h-fit rounded-none border-b p-0 text-xs"
                onClick={() => {
                  destroyMutation.mutate(Object.keys(rowSelection).map(Number));
                }}
              >
                remove
              </Button>
            )}
          </div>
        </div>
      </div>
      <ScrollArea className="h-full">{table}</ScrollArea>
    </div>
  );
};
