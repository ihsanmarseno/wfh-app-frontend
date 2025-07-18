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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

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
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'today' | 'thisWeek'>('all')

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

  const fetchAttendance = async (pageNum: number, selectedFilter: string) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `http://localhost:5002/v1/api/attendance/all?filter=${selectedFilter}&page=${pageNum}&pageSize=5`,
        {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        }
      )
      setAttendances(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      console.error('Failed fetch attendance:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAttendance(page, filter)
  }, [page, filter])

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

          {/* Filter buttons */}
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
            <div className='overflow-x-auto rounded-md border shadow-sm'>
              <table className='w-full text-left'>
                <thead className='bg-muted text-sm'>
                  <tr>
                    <th className='p-3'>User</th>
                    <th className='p-3'>Email</th>
                    <th className='p-3'>Role</th>
                    <th className='p-3'>Date</th>
                    <th className='p-3'>Time</th>
                    <th className='p-3'>Status</th>
                    <th className='p-3'>Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att) => {
                    const date = new Date(att.clockInTime)
                    return (
                      <tr key={att.id} className='hover:bg-muted/30 border-b'>
                        <td className='p-3 font-medium'>
                          {att.user?.name || 'Unknown'}
                        </td>
                        <td className='p-3'>{att.user?.email || '-'}</td>
                        <td className='p-3'>
                          <span
                            className={`rounded px-2 py-1 text-sm ${
                              att.user?.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {att.user?.role || '-'}
                          </span>
                        </td>
                        <td className='p-3'>
                          {new Intl.DateTimeFormat('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }).format(date)}
                        </td>
                        <td className='p-3'>
                          {new Intl.DateTimeFormat('en-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).format(date)}
                        </td>
                        <td className='p-3'>
                          <span
                            className={`rounded px-2 py-1 text-sm ${
                              att.status === 'Late'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className='p-3'>
                          <img
                            src={`http://localhost:5002${att.photoUrl}`}
                            alt='Attendance photo'
                            className='h-14 w-14 cursor-pointer rounded-md border object-cover hover:opacity-80'
                            onClick={() =>
                              setSelectedPhoto(
                                `http://localhost:5002${att.photoUrl}`
                              )
                            }
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta && (
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
              disabled={page === meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Modal for Photo */}
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
                alt='Full attendance'
                className='mx-auto max-h-[80vh] rounded'
              />
            )}
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
