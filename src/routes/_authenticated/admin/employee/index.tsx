import { createFileRoute } from '@tanstack/react-router'
import RouteComponent from '../../../../features/admin/employee'

export const Route = createFileRoute('/_authenticated/admin/employee/')({
  component: RouteComponent,
})
