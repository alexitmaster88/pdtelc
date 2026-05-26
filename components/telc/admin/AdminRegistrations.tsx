"use client"

import { useState, useEffect } from "react"
import { Eye, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  paid: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    const data = await fetch("/api/telc/registrations").then(r => r.json()).catch(() => [])
    setRegistrations(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch("/api/telc/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
      toast.success("Status updated")
      load()
      if (selected?.id === id) setSelected({ ...selected, status })
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Registrations</h2>
        <span className="text-sm text-slate-500">{registrations.length} total</span>
      </div>

      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-900">Registration #{selected.id}</h3>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              ["Name", `${selected.first_name} ${selected.last_name}`],
              ["Email", selected.email],
              ["Phone", selected.phone_number],
              ["Passport", selected.passport_number],
              ["Email Verified", selected.email_verified ? "✓ Yes" : "✗ No"],
              ["Payment Verified", selected.payment_verified ? "✓ Yes" : "✗ No"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-1">Update Status</p>
            <select
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-primary"
              value={selected.status}
              onChange={e => handleStatusChange(selected.id, e.target.value)}
              disabled={updatingId === selected.id}
            >
              {["pending","verified","paid","completed","cancelled"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-slate-500">
            <Loader2 className="animate-spin" size={20} /> Loading...
          </div>
        ) : registrations.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No registrations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Name","Email","Phone","Level","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{reg.first_name} {reg.last_name}</td>
                    <td className="px-4 py-3 text-slate-600">{reg.email}</td>
                    <td className="px-4 py-3 text-slate-600">{reg.phone_number}</td>
                    <td className="px-4 py-3 text-slate-600">{reg.exams?.exam_levels?.level ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[reg.status] ?? "bg-slate-100 text-slate-800"}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(reg)}
                        className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
