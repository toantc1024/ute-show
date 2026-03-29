"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple mock login logic - redirects to admin
    if (password) {
      router.push("/admin")
    }
  }

  return (
    <div className="bg-[#0f172a] font-body text-slate-200 min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      {/* Animated Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1B69FF] blur-[150px] opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF6D00] blur-[150px] opacity-20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Main Login Container */}
      <main className="relative z-10 w-full max-w-md px-6 flex-1 flex flex-col justify-center">
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Accent Border (using inline styles to mimic pseudo-element if needed, or just standard div) */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#1B69FF] to-[#FF6D00] shadow-[0_0_10px_rgba(27,105,255,0.5)]"></div>
          
          {/* Login Content Area */}
          <div className="w-full py-12 px-10">
            {/* Branding */}
            <div className="flex flex-col items-center mb-10">
              <div className="flex items-center gap-1 mb-6">
                <span className="text-3xl font-black tracking-tighter text-[#1B69FF]">UTE</span>
                <span className="text-3xl font-black tracking-tighter text-[#FF6D00]">Check-in</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-widest uppercase">Trang Quản Trị</h1>
              <p className="text-slate-400 text-sm mt-2 text-center font-medium">Hệ thống điểm danh công nghệ cao</p>
            </div>
            
            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              
              {/* Password Input ONLY (Email removed as requested) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1" htmlFor="password">
                  Mật khẩu truy cập
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input 
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-white placeholder:text-slate-600 transition-all outline-none" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Options */}
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="w-4 h-4 rounded-sm border-white/10 text-primary focus:ring-primary/20 bg-slate-900/50 cursor-pointer" type="checkbox"/>
                  <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Ghi nhớ đăng nhập</span>
                </label>
              </div>
              
              {/* Submit Button */}
              <button 
                className="w-full bg-[#1B69FF] text-white font-black text-sm py-4 rounded-lg shadow-lg shadow-primary/20 hover:bg-[#FF6D00] hover:shadow-[#FF6D00]/20 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest" 
                type="submit"
              >
                Đăng Nhập Hệ Thống
              </button>
            </form>
            
            {/* Footer Support */}
            <div className="mt-10 text-center">
              <p className="text-[11px] text-slate-500">Bạn gặp sự cố? <a className="text-primary font-bold hover:underline" href="#">Liên hệ hỗ trợ kỹ thuật</a></p>
            </div>
          </div>
        </div>
        
        {/* System Status Indicator */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Node Cluster: Online</span>
          </div>
          <div className="w-[1px] h-3 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">v3.0.0-PRO</span>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full mt-auto py-8 px-12 bg-white/5 backdrop-blur-[40px] border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-black tracking-tighter">
            <span className="text-[#1B69FF]">UTE</span><span className="text-[#FF6D00]">Check-in</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">© 2026 YHCMUTE</p>
            <div className="flex gap-6">
              <span className="text-[11px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest cursor-pointer">Privacy</span>
              <span className="text-[11px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest cursor-pointer">Terms</span>
              <span className="text-[11px] font-bold text-slate-500 hover:text-white transition-all uppercase tracking-widest cursor-pointer">Status</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
