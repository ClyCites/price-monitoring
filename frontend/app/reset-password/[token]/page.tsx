// app/reset-password/[token]/page.tsx

import { useParams } from "next/navigation"
import ResetPasswordForm from "@/components/auth/reset-password-form"


export default function ResetPasswordPage() {
  const params = useParams()
  const token = params.token as string
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <ResetPasswordForm token={token} />
    </div>
  )
}
