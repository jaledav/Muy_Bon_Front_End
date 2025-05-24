import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f9f5f0] py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <LoginForm />
      </div>
    </main>
  )
}
