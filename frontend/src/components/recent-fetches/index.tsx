import { GeoData } from '@/api/schema';
import { ScrollArea } from '../ui/scroll-area';
import { useList } from '@/hooks/use-list';
import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '../data-table';
import { columns } from './columns';
import { RowSelectionState } from '@tanstack/react-table';

type Props = {
  onRowSelected: (id: GeoData['id']) => void;
};

export const RecentFetches = ({ onRowSelected }: Props) => {
  const { query } = useList({
    page_size: 10,
  });
  const { data, isLoading } = query;
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    const selectedRow = Object.keys(rowSelection)[0];
    if (!selectedRow) {
      return;
    }

    onRowSelected(Number(selectedRow));
  }, [rowSelection]);

  const table = useMemo(
    () => (
      <DataTable
        columns={columns}
        data={data?.data || []}
        disableHeader
        isLoading={isLoading}
        isRowDisabled={(row) => row.status === 'FAILED'}
        options={{
          getRowId: (row) => String(row.id),
          onRowSelectionChange: setRowSelection,
          enableRowSelection: true,
          enableMultiRowSelection: false,
          state: {
            rowSelection,
          },
        }}
      />
    ),
    [columns, data, rowSelection]
  );

  return (
    <div className="flex-1">
      <h2 className="text-center text-sm font-medium">Recent Fetches</h2>
      <ScrollArea className="h-full max-h-64 p-2">{table}</ScrollArea>
    </div>
  );
};
