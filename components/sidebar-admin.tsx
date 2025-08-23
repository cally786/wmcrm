import { Sidebar } from "@/components/sidebar"

export function SidebarAdmin({ className }: { className?: string }) {
  return <Sidebar className={className} userRole="admin" />
}