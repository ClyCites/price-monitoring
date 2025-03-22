import ResetPasswordForm from "@/components/auth/reset-password-form"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <ResetPasswordForm token={params.token} />
    </div>
  )
}

