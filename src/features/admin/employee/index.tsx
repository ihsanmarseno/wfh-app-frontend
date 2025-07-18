import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    password: '',
  })

  // AlertDialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const fetchUsers = async (pageNum: number) => {
    setLoading(true)
    const res = await axios.get(
      `${userServiceUrl}/auth/users?page=${pageNum}&pageSize=5`,
      {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      }
    )
    setUsers(res.data.data)
    setMeta(res.data.meta)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers(page)
  }, [page])

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
      password: '',
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        // update
        await axios.put(
          `${userServiceUrl}/auth/users/${editingUser.id}`,
          formData,
          { headers: { Authorization: `Bearer ${Cookies.get('token')}` } }
        )
        toast.success('Employee updated successfully')
      } else {
        // create
        await axios.post(`${userServiceUrl}/auth/users`, formData, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        })
        toast.success('Employee created successfully')
      }
      setIsModalOpen(false)
      fetchUsers(page)
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
      await axios.delete(`${userServiceUrl}/auth/users/${deletingUser.id}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      })
      toast.success('Employee deleted successfully')
      setIsDeleteOpen(false)
      fetchUsers(page)
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
            <div className='overflow-x-auto rounded-md border shadow-sm'>
              <table className='w-full text-left'>
                <thead className='bg-muted text-sm'>
                  <tr>
                    <th className='p-3'>Name</th>
                    <th className='p-3'>Email</th>
                    <th className='p-3'>Role</th>
                    <th className='p-3'>Joined</th>
                    <th className='p-3 text-right'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const joinedDate = new Date(user.createdAt)
                    return (
                      <tr key={user.id} className='hover:bg-muted/30 border-b'>
                        <td className='p-3 font-medium'>{user.name}</td>
                        <td className='p-3'>{user.email}</td>
                        <td className='p-3'>
                          <span
                            className={`rounded px-2 py-1 text-sm ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className='p-3'>
                          {joinedDate.toLocaleDateString()}{' '}
                          {joinedDate.toLocaleTimeString()}
                        </td>
                        <td className='space-x-2 p-3 text-right'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => confirmDelete(user)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
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
      </Main>

      {/* Modal for Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Employee' : 'Add Employee'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label className='mb-2'>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className='mb-2'>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            {!editingUser && (
              <div>
                <Label className='mb-2'>Password</Label>
                <Input
                  type='password'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            )}
            <div>
              <Label className='mb-2'>Role</Label>
              <select
                className='w-full rounded border p-2'
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

      {/* AlertDialog for Delete */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <p>This will permanently delete {deletingUser?.name}'s account.</p>
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
