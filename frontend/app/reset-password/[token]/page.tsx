import ResetPasswordForm from "@/components/auth/reset-password-form"

type ResetPasswordPageProps = {
  params: {
    token: string;
  };
};

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <ResetPasswordForm token={params.token} />
    </div>
  );
}
