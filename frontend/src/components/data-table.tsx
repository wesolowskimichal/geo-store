import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { cn } from '@/lib/utils';
import { withBool } from '@/hocs/with-bool';
import { Skeleton } from './ui/skeleton';
import { LegacyRef } from 'react';

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  options?: Partial<Omit<TableOptions<T>, 'columns' | 'data'>>;
  className?: string;
  parentClassName?: string;
  disableHeader?: boolean;
  isLoading?: boolean;
  isFooter?: boolean;
  footerRef?: LegacyRef<HTMLTableRowElement>;
  isRowDisabled?: (row: T) => boolean;
};

export const DataTable = <T,>({
  columns,
  data,
  options,
  className,
  parentClassName,
  footerRef,
  disableHeader = false,
  isLoading = false,
  isFooter = false,
  isRowDisabled,
}: Props<T>) => {
  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    ...options,
    getPaginationRowModel: getPaginationRowModel(),
    columns,
    data,
  });

  return (
    <Table
      className={cn('border-b border-l border-r border-solid', className)}
      parentClassName={parentClassName}
    >
      <TableHeader className="sticky top-0 bg-gray-100">
        {withBool({
          component: table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center justify-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          )),
          condition: disableHeader || isLoading,
        })}
      </TableHeader>
      <TableBody>
        {withBool({
          component: table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                data-disabled={isRowDisabled?.(row.original)}
                className={cn(
                  options?.enableRowSelection && 'cursor-pointer',
                  isRowDisabled?.(row.original) && 'opacity-25'
                )}
                onClick={row.getToggleSelectedHandler()}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <div className="flex items-center justify-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ),
          condition: isLoading,
          fallback: (
            <>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton className="h-8" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ),
        })}
        {withBool({
          component: (
            <TableRow ref={footerRef ?? null}>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  <Skeleton className="h-8" />
                </TableCell>
              ))}
            </TableRow>
          ),
          condition: !isFooter,
        })}
      </TableBody>
    </Table>
  );
};
