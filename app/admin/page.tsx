"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, DollarSign, Users, LogOut, Loader2, CreditCard } from "lucide-react"
import AdminExams from "@/components/telc/admin/AdminExams"
import AdminPricing from "@/components/telc/admin/AdminPricing"
import AdminRegistrations from "@/components/telc/admin/AdminRegistrations"
import AdminPayments from "@/components/telc/admin/AdminPayments"
import { Toaster } from "sonner"

type Tab = "exams" | "pricing" | "registrations" | "payments"

const BASE_TABS = [
  { id: "exams" as Tab, label: "Manage Exams", Icon: Calendar },
  { id: "pricing" as Tab, label: "Pricing", Icon: DollarSign },
  { id: "registrations" as Tab, label: "Registrations", Icon: Users },
]
const SUPERROOT_TABS = [
  ...BASE_TABS,
  { id: "payments" as Tab, label: "Payments", Icon: CreditCard },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>("exams")

  const isSuperRoot = admin?.role === "superroot"
  const tabs = isSuperRoot ? SUPERROOT_TABS : BASE_TABS

  useEffect(() => {
    const token = localStorage.getItem("telc_admin_token")
    if (!token) { router.replace("/telc/admin/login"); return }

    fetch("/api/telc/admin/login", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ admin }) => { setAdmin(admin); setChecking(false) })
      .catch(() => { localStorage.removeItem("telc_admin_token"); router.replace("/telc/admin/login") })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("telc_admin_token")
    localStorage.removeItem("telc_admin")
    router.replace("/telc/admin/login")
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm">
              AD
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Admin Dashboard</h1>
              {admin && (
                <p className="text-xs text-slate-500">
                  {admin.name ?? admin.email}
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    admin.role === "superroot" ? "bg-amber-100 text-amber-700" :
                    admin.role === "superadmin" ? "bg-purple-100 text-purple-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {admin.role}
                  </span>
                </p>
              )}
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="sticky top-[65px] z-30 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900"
                }`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {tab === "exams" && <AdminExams />}
        {tab === "pricing" && <AdminPricing />}
        {tab === "registrations" && <AdminRegistrations />}
        {tab === "payments" && isSuperRoot && <AdminPayments />}
      </div>
    </div>
  )
}
