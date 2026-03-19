"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, LogOut, ShieldCheck } from "lucide-react"

// ─── Admin Context ───────────────────────────────────────────────────────────
type AdminCtx = {
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminCtx>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
})

export function useAdmin() {
  return useContext(AdminContext)
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  // Persist across page refreshes within same session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("ute-admin")
      if (stored === "true") setIsAdmin(true)
    }
  }, [])

  const login = (password: string): boolean => {
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (password === correctPassword) {
      setIsAdmin(true)
      sessionStorage.setItem("ute-admin", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    sessionStorage.removeItem("ute-admin")
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

// ─── Simple Password Gate ────────────────────────────────────────────────────
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, login, logout } = useAdmin()
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = login(password.trim())
    if (!ok) {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
    setPassword("")
  }

  if (isAdmin) {
    return (
      <div>
        {/* Admin status bar */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <ShieldCheck className="h-4 w-4" />
            Đã xác thực Admin
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-red-500 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="mr-1 h-4 w-4" />
            Thoát
          </Button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-blue-100 p-3">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Trang Quản Trị</h2>
          <p className="text-sm text-slate-500">Nhập mật khẩu để tiếp tục</p>
        </div>

        <Input
          type="password"
          placeholder="Mật khẩu admin..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={
            "text-center text-lg tracking-widest " +
            (error ? "border-red-400 bg-red-50" : "border-slate-300")
          }
          autoFocus
        />
        {error && (
          <p className="text-center text-sm font-medium text-red-500">
            Sai mật khẩu. Vui lòng thử lại.
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-blue-600 font-semibold hover:bg-blue-700"
        >
          Xác nhận
        </Button>
      </form>
    </div>
  )
}
