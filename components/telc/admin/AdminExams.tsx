"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const REGIONS = ["tashkent","samarkand","fergana","kashkadarya","bukhara","urgench"]
const REGION_LABELS: Record<string,string> = { tashkent:"Tashkent", samarkand:"Samarkand", fergana:"Fergana", kashkadarya:"Kashkadarya", bukhara:"Bukhara", urgench:"Urgench" }

const inputCls = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
const labelCls = "mb-1 block text-xs font-medium text-slate-600"

export default function AdminExams() {
  const [exams, setExams] = useState<any[]>([])
  const [levels, setLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ levelId: "1", region: "tashkent", address: "", examDate: "", startTime: "09:00", endTime: "11:00", capacity: "30" })

  const load = async () => {
    setLoading(true)
    const [e, l] = await Promise.all([
      fetch("/api/telc/exams").then(r => r.json()).catch(() => []),
      fetch("/api/telc/exam-levels").then(r => r.json()).catch(() => []),
    ])
    setExams(Array.isArray(e) ? e : [])
    setLevels(Array.isArray(l) ? l : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam?")) return
    const res = await fetch(`/api/telc/exams?id=${id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Exam deleted"); load() }
    else toast.error("Failed to delete")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.examDate) { toast.error("Exam date required"); return }
    setSubmitting(true)
    try {
      const res = await fetch("/api/telc/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId: parseInt(form.levelId),
          region: form.region,
          address: form.address || null,
          examDate: new Date(form.examDate).toISOString(),
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: parseInt(form.capacity),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Exam created")
      setShowForm(false)
      setForm({ levelId: "1", region: "tashkent", address: "", examDate: "", startTime: "09:00", endTime: "11:00", capacity: "30" })
      load()
    } catch {
      toast.error("Failed to create exam")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Manage Exams</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus size={16} className="mr-1" /> Add Exam
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Create New Exam</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Level</label>
              <select className={inputCls} value={form.levelId} onChange={e => setForm({...form, levelId: e.target.value})}>
                {levels.map((l: any) => <option key={l.id} value={l.id}>{l.level}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Region</label>
              <select className={inputCls} value={form.region} onChange={e => setForm({...form, region: e.target.value})}>
                {REGIONS.map(r => <option key={r} value={r}>{REGION_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Address (optional)</label>
              <input className={inputCls} placeholder="Exam location address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div>
              <label className={labelCls}>Exam Date</label>
              <input type="date" className={inputCls} required value={form.examDate} onChange={e => setForm({...form, examDate: e.target.value})} />
            </div>
            <div>
              <label className={labelCls}>Capacity</label>
              <input type="number" className={inputCls} min="1" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
            </div>
            <div>
              <label className={labelCls}>Start Time</label>
              <input type="time" className={inputCls} value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
            </div>
            <div>
              <label className={labelCls}>End Time</label>
              <input type="time" className={inputCls} value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting && <Loader2 size={16} className="animate-spin mr-2" />} Create Exam
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-slate-500"><Loader2 className="animate-spin" size={20}/> Loading...</div>
        ) : exams.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No exams yet. Create your first exam.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Level","Region","Date","Time","Capacity","Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-700">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex: any) => (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{ex.exam_levels?.level ?? `Level ${ex.level_id}`}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{REGION_LABELS[ex.region] ?? ex.region}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(ex.exam_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{ex.start_time} – {ex.end_time}</td>
                    <td className="px-4 py-3 text-slate-600">{ex.registered_count}/{ex.capacity}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(ex.id)} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium">
                        <Trash2 size={14}/> Delete
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
