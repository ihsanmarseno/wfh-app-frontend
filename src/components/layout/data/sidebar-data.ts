import Cookies from 'js-cookie'
import { IconChecklist, IconUsers, IconUserCog } from '@tabler/icons-react'
import { CalendarCheck } from 'lucide-react'

export type SidebarItem = {
  title: string
  url: string
  icon: React.ComponentType<any>
}

export type SidebarNavGroup = {
  title: string
  items: SidebarItem[]
}

export type SidebarTeam = {
  name: string
  logo: React.ComponentType<any>
  plan: string
}

export type SidebarUser = {
  name: string
  email: string
  avatar: string
}

export type SidebarData = {
  user: SidebarUser
  teams: SidebarTeam[]
  navGroups: SidebarNavGroup[]
}

const role = Cookies.get('role')
const name = Cookies.get('name')
const email = Cookies.get('email')

// Default menu untuk Employee
// eslint-disable-next-line prefer-const
let navGroups: SidebarNavGroup[] = [
  {
    title: 'Employees',
    items: [
      {
        title: 'Daily Attendance',
        url: '/',
        icon: CalendarCheck,
      },
      {
        title: 'History',
        url: '/history',
        icon: IconChecklist,
      },
    ],
  },
]

// Jika Admin, tambahkan menu Admin
if (role === 'admin') {
  navGroups.push({
    title: 'Admin',
    items: [
      {
        title: 'Manage Employees',
        url: '/admin/employee',
        icon: IconUsers,
      },
      {
        title: 'Attendance Control',
        url: '/admin/attendance',
        icon: IconUserCog,
      },
    ],
  })
}

export const sidebarData: SidebarData = {
  user: {
    name: name || 'satnaing',
    email: email || 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'WFH Apps',
      logo: CalendarCheck,
    },
  ],
  navGroups,
}
