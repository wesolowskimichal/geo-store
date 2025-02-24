import { GeoDataShort } from '@/api/schema';
import { ColumnDef } from '@tanstack/react-table';
import { Flag } from '../flag';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { CornerStatus } from '../corner-status';
import { withBool } from '@/hocs/with-bool';
import { Minus } from 'lucide-react';

export const columns: ColumnDef<GeoDataShort>[] = [
  {
    id: 'address_status',
    header: '',
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="relative p-1">
            <CornerStatus status={row.original.status}>
              <span>{row.original.ip_or_url}</span>
            </CornerStatus>
          </TooltipTrigger>
          <TooltipContent>
            {row.original.status === 'SUCCESS' ? (
              <p>Successfully fetched</p>
            ) : (
              <p>Failed to fetch</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: 'country',
    header: 'Country',
    cell: ({ row }) =>
      withBool({
        component: (
          <span className="flex items-center">
            <Flag
              flagUnicode={row.original.country_flag_emoji_unicode}
              fallback={null}
            />{' '}
            {row.original.country_name}
          </span>
        ),
        condition: row.original.country_name.length === 0,
        fallback: <Minus className="size-4" />,
      }),
  },
  {
    id: 'latitude_longitude',
    header: 'Location',
    cell: ({ row }) =>
      withBool({
        component: (
          <span>
            {row.original.latitude} {row.original.longitude}
          </span>
        ),
        condition:
          row.original.latitude === null || row.original.longitude === null,
        fallback: <Minus className="size-4" />,
      }),
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => <span>{row.original.created_at.toLocaleString()}</span>,
  },
];
