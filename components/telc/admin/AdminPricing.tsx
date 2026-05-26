"use client"

import { useState, useEffect } from "react"
import { Edit2, Save, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AdminPricing() {
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [prices, setPrices] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await fetch("/api/telc/exam-levels").then(r => r.json()).catch(() => [])
    const arr = Array.isArray(data) ? data : []
    setLevels(arr)
    const map: Record<number, string> = {}
    arr.forEach((l: any) => { map[l.id] = String(l.price) })
    setPrices(map)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async (levelId: number) => {
    setSaving(true)
    try {
      const res = await fetch("/api/telc/exam-levels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId, price: prices[levelId] }),
      })
      if (!res.ok) throw new Error()
      toast.success("Price updated")
      setEditingId(null)
      load()
    } catch {
      toast.error("Failed to update price")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center gap-2 p-8 text-slate-500">
      <Loader2 className="animate-spin" size={20} /> Loading...
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Manage Pricing</h2>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Level", "Current Price (UZS)", "Actions"].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {levels.map((level: any) => (
              <tr key={level.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-slate-900">{level.level}</td>
                <td className="px-6 py-4 text-slate-600">
                  {editingId === level.id ? (
                    <input
                      type="number"
                      className="w-40 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-primary"
                      value={prices[level.id]}
                      onChange={e => setPrices({ ...prices, [level.id]: e.target.value })}
                    />
                  ) : (
                    `${Number(prices[level.id]).toLocaleString()} UZS`
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === level.id ? (
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleSave(level.id)} disabled={saving}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-xs">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingId(level.id)}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 text-xs font-medium">
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
