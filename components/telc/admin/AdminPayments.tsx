"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Loader2, Eye, X } from "lucide-react"
import { toast } from "sonner"

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending:   "bg-yellow-100 text-yellow-800",
  failed:    "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-600",
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [actingId, setActingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    const data = await fetch("/api/telc/payments").then(r => r.json()).catch(() => [])
    setPayments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAction = async (payment: any, action: "accept" | "cancel") => {
    setActingId(payment.id)
    try {
      const res = await fetch("/api/telc/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          registrationId: payment.registration_id,
          action,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(action === "accept" ? "Payment accepted" : "Payment cancelled")
      load()
      if (selected?.id === payment.id) setSelected(null)
    } catch {
      toast.error("Failed to update payment")
    } finally {
      setActingId(null)
    }
  }

  const fmt = (n: any) => Number(n).toLocaleString("ru-RU") + " UZS"
  const fmtDate = (d: string) => new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Payments</h2>
        <span className="text-sm text-slate-500">{payments.length} total</span>
      </div>

      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-900">Payment #{selected.id}</h3>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-5">
            {[
              ["Registrant", `${selected.registrations?.first_name ?? ""} ${selected.registrations?.last_name ?? ""}`],
              ["Email", selected.registrations?.email ?? "—"],
              ["Phone", selected.registrations?.phone_number ?? "—"],
              ["Passport", selected.registrations?.passport_number ?? "—"],
              ["Amount", fmt(selected.amount)],
              ["Method", selected.payment_method],
              ["Gateway", selected.gateway ?? "manual"],
              ["Transaction ID", selected.transaction_id ?? "—"],
              ["Created", fmtDate(selected.created_at)],
              ["Verified at", selected.verified_at ? fmtDate(selected.verified_at) : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          {(selected.status === "pending" || selected.status === "completed") && (
            <div className="flex gap-3">
              {selected.status === "pending" && (
                <button
                  onClick={() => handleAction(selected, "accept")}
                  disabled={actingId === selected.id}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actingId === selected.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Accept Payment
                </button>
              )}
              <button
                onClick={() => handleAction(selected, "cancel")}
                disabled={actingId === selected.id}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {actingId === selected.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Cancel Payment
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-slate-500">
            <Loader2 className="animate-spin" size={20} /> Loading...
          </div>
        ) : payments.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Registrant", "Amount", "Method", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.registrations?.first_name ?? "—"} {p.registrations?.last_name ?? ""}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{fmt(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{p.payment_method}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-slate-100 text-slate-800"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelected(p)}
                          className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium">
                          <Eye size={14} /> View
                        </button>
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAction(p, "accept")}
                              disabled={actingId === p.id}
                              className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-40"
                            >
                              {actingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Accept
                            </button>
                            <button
                              onClick={() => handleAction(p, "cancel")}
                              disabled={actingId === p.id}
                              className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-40"
                            >
                              {actingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Cancel
                            </button>
                          </>
                        )}
                      </div>
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
