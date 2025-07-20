import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
// ✅ Impor komponen Tabel
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

// Pastikan path ini benar

interface Attendance {
  id: number
  clockInTime: string
  photoUrl: string
  status: 'Late' | 'On Time'
  user: {
    id: number
    name: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
  } | null
}

interface Meta {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export default function AttendanceControl() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const attendanceServiceUrl = import.meta.env.VITE_ATTENDANCE_SERVICE_URL
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'today' | 'thisWeek'>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const fetchAttendance = async (pageNum: number, selectedFilter: string) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${attendanceServiceUrl}/v1/api/attendance/all?filter=${selectedFilter}&page=${pageNum}&pageSize=5`,
        {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        }
      )
      setAttendances(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      console.error('Failed to fetch attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance(page, filter)
  }, [page, filter, attendanceServiceUrl])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Attendance Control
            </h2>
            <p className='text-muted-foreground'>
              View all attendance records with user info.
            </p>
          </div>
          <div className='space-x-2'>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => {
                setPage(1)
                setFilter('all')
              }}
            >
              All
            </Button>
            <Button
              variant={filter === 'today' ? 'default' : 'outline'}
              onClick={() => {
                setPage(1)
                setFilter('today')
              }}
            >
              Today
            </Button>
            <Button
              variant={filter === 'thisWeek' ? 'default' : 'outline'}
              onClick={() => {
                setPage(1)
                setFilter('thisWeek')
              }}
            >
              This Week
            </Button>
          </div>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-2'>
          {loading ? (
            <div className='flex justify-center p-8'>
              <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
            </div>
          ) : (
            // ✅ Menggunakan komponen Tabel kustom
            <Table className='border shadow-sm'>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Photo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((att) => {
                  const date = new Date(att.clockInTime)
                  return (
                    <TableRow key={att.id}>
                      <TableCell className='font-medium'>
                        {att.user?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{att.user?.email || '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            att.user?.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          }`}
                        >
                          {att.user?.role || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }).format(date)}
                      </TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat('en-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        }).format(date)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            att.status === 'Late'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          }`}
                        >
                          {att.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <img
                          src={`${attendanceServiceUrl}${att.photoUrl}`}
                          alt='Attendance'
                          className='h-14 w-14 cursor-pointer rounded-md border object-cover hover:opacity-80'
                          onClick={() =>
                            setSelectedPhoto(
                              `${attendanceServiceUrl}${att.photoUrl}`
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {meta && meta.totalItems > 0 && (
          <div className='mt-4 flex items-center justify-between'>
            <Button
              variant='outline'
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <p className='text-muted-foreground text-sm'>
              Page {meta.currentPage} of {meta.totalPages}
            </p>
            <Button
              variant='outline'
              disabled={page === meta.totalPages || meta.totalPages === 0}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Modal untuk Foto */}
        <Dialog
          open={!!selectedPhoto}
          onOpenChange={() => setSelectedPhoto(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attendance Photo</DialogTitle>
            </DialogHeader>
            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt='Full attendance view'
                className='mx-auto max-h-[80vh] rounded-lg'
              />
            )}
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
