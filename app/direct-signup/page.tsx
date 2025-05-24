import DirectSignupTest from "@/components/auth/direct-signup-test"

export default function DirectSignupTestPage() {
  return (
    <main className="min-h-screen bg-[#f9f5f0] py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Direct Supabase Signup Test</h1>
        <p className="text-center mb-8">This page tests direct Supabase signup without any custom code.</p>
        <DirectSignupTest />
      </div>
    </main>
  )
}
