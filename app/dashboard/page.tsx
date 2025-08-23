import { redirect } from "next/navigation"

export default function DashboardPage() {
  // In a real app, you'd check authentication here
  // For demo purposes, redirect to commercial dashboard
  redirect("/comercial/dashboard")
}
