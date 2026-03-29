import Image from "next/image"

export function EventLogo() {
  return (
    <div className="absolute top-6  left-4 z-50 flex items-center gap-3 md:top-10 md:left-8">
      {/* Logo with glassmorphism background */}
      <div className="relative h-32 w-32 shrink-0 rounded-lg border border-white/25 backdrop-blur-md md:h-20 md:w-20">
        <div className="absolute inset-0 flex items-center justify-center rounded-lg text-xs font-bold text-slate-300">
          LOGO
        </div>
        <Image
          src="/assets/LOGO.png"
          alt="Logo UTE"
          fill
          className="object-cover"
          sizes="400px"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </div>
    </div>
  )
}
