import { GeoDataShort } from '@/api/schema';
import { ColumnDef } from '@tanstack/react-table';
import { Flag } from '../flag';
import { withBool } from '@/hocs/with-bool';
import { Minus } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

export const columns: ColumnDef<GeoDataShort>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'ip_or_url',
    header: 'Address',
    cell: ({ row }) => <span>{row.original.ip_or_url}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) =>
      withBool({
        component: <span>{row.original.type}</span>,
        condition: row.original.type.length == 0,
        fallback: <Minus className="size-4" />,
      }),
  },
  {
    id: 'country',
    header: 'Country',
    cell: ({ row }) =>
      withBool({
        component: (
          <div className="flex items-center">
            <Flag
              flagUnicode={row.original.country_flag_emoji_unicode}
              fallback={null}
            />{' '}
            {row.original.country_name}
          </div>
        ),
        condition: row.original.country_name.length == 0,
        fallback: <Minus className="size-4" />,
      }),
  },
  {
    accessorKey: 'latitude',
    header: 'Latitude',
    cell: ({ row }) =>
      withBool({
        component: <span>{row.original.latitude}</span>,
        condition: !row.original.latitude,
        fallback: <Minus className="size-4" />,
      }),
  },
  {
    accessorKey: 'longitude',
    header: 'Longitude',
    cell: ({ row }) =>
      withBool({
        component: <span>{row.original.longitude}</span>,
        condition: !row.original.longitude,
        fallback: <Minus className="size-4" />,
      }),
  },
  {
    accessorKey: 'updated_at',
    header: 'Fetch Date',
    cell: ({ row }) => <span>{row.original.updated_at.toLocaleString()}</span>,
  },
];
