"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Toaster } from "sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/telc/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? "Invalid credentials")
      }
      const { token, admin } = await res.json()
      localStorage.setItem("telc_admin_token", token)
      localStorage.setItem("telc_admin", JSON.stringify(admin))
      router.push("/telc/admin")
    } catch (err: any) {
      toast.error(err.message ?? "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-500">TELC Exam Management</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" className={inputCls} placeholder="admin@profi-deutsch.uz"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" className={inputCls} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Default: admin@profi-deutsch.uz / Admin1234
          </p>
        </div>
      </div>
    </div>
  )
}
