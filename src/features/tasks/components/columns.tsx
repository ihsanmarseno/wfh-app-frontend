import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type Attendance = {
  id: number
  clockInTime: string
  photoUrl: string
  status: 'Late' | 'On Time'
  fullPhotoUrl?: string
}

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'clockInTime',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.clockInTime)
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date)
    },
  },
  {
    accessorKey: 'time',
    header: 'Time',
    cell: ({ row }) => {
      const date = new Date(row.original.clockInTime)
      return new Intl.DateTimeFormat('en-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date)
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant={status === 'Late' ? 'destructive' : 'default'}
          className={
            status === 'Late'
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600'
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'photo',
    header: 'Photo',
    cell: ({ row }) => {
      const url = row.original.fullPhotoUrl || row.original.photoUrl
      return (
        <img
          src={url}
          alt='Attendance photo'
          className='h-14 w-14 cursor-pointer rounded-md border object-cover hover:opacity-80'
          onClick={() => row.original.onClickPhoto?.(url)}
        />
      )
    },
  },
]
