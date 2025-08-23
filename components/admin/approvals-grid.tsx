"use client"

import { useState, useEffect } from "react"
import { ApprovalCard } from "./approval-card"
import { ApprovalFilters } from "./approval-filters"
import { ApprovalModal } from "./approval-modal"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BarApproval {
  id: string
  name: string
  nit: string
  address: string
  city: string
  phone: string
  email: string
  contact: string
  channel: "A" | "B"
  commercial: string
  registrationDate: string
  status: "pending" | "approved" | "rejected"
  eventDate?: string
  documents: string[]
  rejectionReason?: string
}

const mockApprovals: BarApproval[] = [
  {
    id: "1",
    name: "Bar El Nuevo Rincón",
    nit: "900123456-7",
    address: "Calle 85 #15-20",
    city: "Bogotá",
    phone: "+57 301 234 5678",
    email: "contacto@elnuevorincon.com",
    contact: "Pedro Martínez",
    channel: "A",
    commercial: "Juan Pérez",
    registrationDate: "2024-12-17",
    status: "pending",
    eventDate: "2024-12-25",
    documents: ["/bar-exterior.jpg", "/license.pdf"],
  },
  {
    id: "2",
    name: "Cantina Central",
    nit: "800987654-3",
    address: "Carrera 13 #45-67",
    city: "Medellín",
    phone: "+57 302 345 6789",
    email: "info@cantinacentral.com",
    contact: "Laura Gómez",
    channel: "B",
    commercial: "María García",
    registrationDate: "2024-12-19",
    status: "pending",
    eventDate: "2024-12-28",
    documents: ["/cantina-interior.jpg"],
  },
  {
    id: "3",
    name: "La Terraza Premium",
    nit: "700456789-1",
    address: "Calle 93 #11-45",
    city: "Bogotá",
    phone: "+57 303 456 7890",
    email: "admin@terrazapremium.com",
    contact: "Roberto Silva",
    channel: "A",
    commercial: "Carlos López",
    registrationDate: "2024-12-15",
    status: "approved",
    eventDate: "2024-12-22",
    documents: ["/terraza-view.jpg", "/permits.pdf"],
  },
]

export function ApprovalsGrid() {
  const [approvals, setApprovals] = useState<BarApproval[]>([])
  const [filteredApprovals, setFilteredApprovals] = useState<BarApproval[]>([])
  const [selectedApproval, setSelectedApproval] = useState<BarApproval | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovals()
  }, [])

  async function fetchApprovals() {
    try {
      setLoading(true)
      
      // Get bars that need approval or have been processed recently
      const { data: barsData, error } = await supabase
        .from('bars')
        .select('*')
        .in('account_status', ['pending_verification', 'active', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        console.error('Error fetching bars for approval:', error)
        return
      }

      // Transform data to match interface
      const transformedApprovals: BarApproval[] = barsData?.map(bar => ({
        id: bar.id,
        name: bar.name,
        nit: bar.nit || 'N/A',
        address: bar.address || 'N/A',
        city: bar.ciudad || 'N/A',
        phone: bar.contacto_telefono || 'N/A',
        email: bar.contacto_email || 'N/A',
        contact: bar.contacto_nombre || 'N/A',
        channel: Math.random() > 0.5 ? "A" : "B", // TODO: Add real channel field
        commercial: "Admin", // TODO: Connect to real comercial
        registrationDate: new Date(bar.created_at).toISOString().split('T')[0],
        status: bar.account_status === 'pending_verification' ? 'pending' as const :
                bar.account_status === 'active' ? 'approved' as const :
                'rejected' as const,
        eventDate: undefined, // TODO: Connect to real events
        documents: [], // TODO: Connect to real documents
        rejectionReason: bar.verification_notes || undefined
      })) || []

      setApprovals(transformedApprovals)
      setFilteredApprovals(transformedApprovals)
      console.log('Bar approvals loaded:', transformedApprovals)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filters: { status: string; channel: string; commercial: string }) => {
    let filtered = approvals

    if (filters.status !== "all") {
      filtered = filtered.filter((approval) => approval.status === filters.status)
    }

    if (filters.channel !== "all") {
      filtered = filtered.filter((approval) => approval.channel === filters.channel)
    }

    if (filters.commercial !== "all") {
      filtered = filtered.filter((approval) => approval.commercial === filters.commercial)
    }

    setFilteredApprovals(filtered)
  }

  const handleApprovalClick = (approval: BarApproval) => {
    setSelectedApproval(approval)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedApproval(null)
  }

  const handleApprovalUpdate = (updatedApproval: BarApproval) => {
    setApprovals((prev) => prev.map((approval) => (approval.id === updatedApproval.id ? updatedApproval : approval)))
    setFilteredApprovals((prev) =>
      prev.map((approval) => (approval.id === updatedApproval.id ? updatedApproval : approval)),
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ApprovalFilters onFilterChange={handleFilterChange} />

      {/* Approvals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-card rounded-lg border p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApprovals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} onClick={() => handleApprovalClick(approval)} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredApprovals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">No hay aprobaciones</h3>
            <p className="text-muted-foreground">No se encontraron bares con los filtros seleccionados</p>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {selectedApproval && (
        <ApprovalModal
          approval={selectedApproval}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleApprovalUpdate}
        />
      )}
    </div>
  )
}
