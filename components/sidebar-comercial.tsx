import { Sidebar } from "@/components/sidebar"

export function SidebarComercial({ className }: { className?: string }) {
  return <Sidebar className={className} userRole="comercial" />
}