import { createFileRoute } from '@tanstack/react-router'
import RouteComponent from '../../../../features/admin/attendance'

export const Route = createFileRoute('/_authenticated/admin/attendance/')({
  component: RouteComponent,
})
