export default function CheckEnvPage() {
  return (
    <main className="min-h-screen bg-[#f9f5f0] py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Environment Variables Check</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">NEXT_PUBLIC_SUPABASE_URL</h2>
              <p className="text-sm text-gray-500 mb-1">This should point to your Supabase project URL</p>
              <div className="bg-gray-100 p-3 rounded">{process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"}</div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
              <p className="text-sm text-gray-500 mb-1">
                This should be your Supabase anon key (first few characters shown)
              </p>
              <div className="bg-gray-100 p-3 rounded">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...`
                  : "Not set"}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">NEXT_PUBLIC_APP_URL</h2>
              <p className="text-sm text-gray-500 mb-1">This should be your application URL</p>
              <div className="bg-gray-100 p-3 rounded">{process.env.NEXT_PUBLIC_APP_URL || "Not set"}</div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-50 text-amber-800 rounded">
            <p className="font-semibold">Troubleshooting steps:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Make sure your .env.local file exists and has the correct values</li>
              <li>Restart your Next.js development server after updating environment variables</li>
              <li>Check that your Supabase project is active and accessible</li>
              <li>Try creating a new Supabase project and updating your environment variables</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  )
}
