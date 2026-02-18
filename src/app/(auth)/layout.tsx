import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" aria-label="Ir al inicio">
            <Logo iconSize={32} />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
