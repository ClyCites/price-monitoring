import ProfileForm from "@/components/auth/profile-form"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      <ProfileForm />
    </div>
  )
}

