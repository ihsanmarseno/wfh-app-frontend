import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

interface Meta {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export default function ManageEmployees() {
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const userServiceUrl = import.meta.env.VITE_USER_SERVICE_URL

  // State untuk modal dan form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    password: '',
  })

  // State untuk dialog konfirmasi hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const fetchUsers = async (pageNum: number) => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${userServiceUrl}/v1/api/auth/users?page=${pageNum}&pageSize=5`,
        {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        }
      )
      setUsers(res.data.data)
      setMeta(res.data.meta)
    } catch (error) {
      toast.error('Failed to fetch users.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page)
  }, [page, userServiceUrl])

  const openAddModal = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'employee', password: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', // Kosongkan password saat edit
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        // Logika untuk update
        await axios.put(
          `${userServiceUrl}/v1/api/auth/users/${editingUser.id}`,
          formData,
          { headers: { Authorization: `Bearer ${Cookies.get('token')}` } }
        )
        toast.success('Employee updated successfully')
      } else {
        // Logika untuk create
        await axios.post(`${userServiceUrl}/v1/api/auth/users`, formData, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        })
        toast.success('Employee created successfully')
      }
      setIsModalOpen(false)
      fetchUsers(page) // Refresh data
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to save employee')
    }
  }

  const confirmDelete = (user: User) => {
    setDeletingUser(user)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    try {
      await axios.delete(
        `${userServiceUrl}/v1/api/auth/users/${deletingUser.id}`,
        {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        }
      )
      toast.success('Employee deleted successfully')
      setIsDeleteOpen(false)
      // Jika halaman menjadi kosong setelah hapus, kembali ke halaman sebelumnya
      if (users.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        fetchUsers(page)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || 'Failed to delete employee')
    }
  }

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
              Manage Employees
            </h2>
            <p className='text-muted-foreground'>
              View, add, update, and remove employee accounts.
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className='mr-2 h-4 w-4' /> Add Employee
          </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className='font-medium'>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='space-x-2 text-right'>
                      <Button
                        size='icon'
                        variant='outline'
                        onClick={() => openEditModal(user)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        size='icon'
                        variant='destructive'
                        onClick={() => confirmDelete(user)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
      </Main>

      {/* Modal untuk Tambah/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div>
              <Label htmlFor='name' className='mb-2'>
                Name
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor='email' className='mb-2'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            {!editingUser && (
              <div>
                <Label htmlFor='password' className='mb-2'>
                  Password
                </Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            )}
            <div>
              <Label htmlFor='role' className='mb-2'>
                Role
              </Label>
              <select
                id='role'
                className='w-full rounded-md border bg-transparent p-2'
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value='employee'>Employee</option>
                <option value='admin'>Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <p className='text-muted-foreground'>
              This will permanently delete the account for {deletingUser?.name}.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
