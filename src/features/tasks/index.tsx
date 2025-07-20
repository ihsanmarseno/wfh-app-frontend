import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
}

interface Meta {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export default function AttendanceHistory() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const attendanceServiceUrl = import.meta.env.VITE_ATTENDANCE_SERVICE_URL

  const fetchAttendance = async (pageNum: number) => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${attendanceServiceUrl}/v1/api/attendance/my-history?page=${pageNum}&pageSize=5`,
        {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        }
      )
      setAttendances(res.data.data)
      setMeta(res.data.meta)
    } catch (error) {
      console.error('Failed to fetch attendance history:', error)
      // Tambahkan notifikasi error jika perlu
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance(page)
  }, [page, attendanceServiceUrl]) // Tambahkan dependency jika URL bisa berubah

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
              Attendance History
            </h2>
            <p className='text-muted-foreground'>
              Review your clock-in records and submitted photos.
            </p>
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
                      <TableCell>
                        {new Intl.DateTimeFormat('en-US', {
                          weekday: 'long',
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
                          className={`rounded px-2 py-1 text-sm ${
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

        {/* Modal for photo */}
        {selectedPhoto && (
          <div
            className='animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-black/60'
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className='bg-background max-w-lg rounded-lg p-4 shadow-lg'
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto}
                alt='Full attendance view'
                className='mx-auto max-h-[80vh] rounded'
              />
              <Button
                className='mt-4 w-full'
                onClick={() => setSelectedPhoto(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
