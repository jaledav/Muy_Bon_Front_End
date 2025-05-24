"use client";

import { useEffect, useState } from "react";

export default function EnvTestPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  useEffect(() => {
    // Fetch environment variables that are safe to expose
    async function checkEnvVars() {
      try {
        const res = await fetch("/api/env-check");
        const data = await res.json();
        setEnvVars(data);
      } catch (error) {
        console.error("Failed to check environment variables:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkEnvVars();
  }, []);

  const testSendEmail = async () => {
    try {
      setIsTestingEmail(true);
      const res = await fetch("/api/test-email", {
        method: "POST",
      });
      const data = await res.json();
      setTestResult(data);
    } catch (error) {
      console.error("Failed to test email:", error);
      setTestResult({ error: "Failed to send test email" });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Environment Variables Test</h1>
      
      {isLoading ? (
        <p>Loading environment variables...</p>
      ) : (
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Environment Variables:</h2>
          <pre className="whitespace-pre-wrap">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="mb-1">
                <strong>{key}:</strong> {value ? "✅ Available" : "❌ Not available"}
              </div>
            ))}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Email Sending</h2>
        <button 
          onClick={testSendEmail} 
          disabled={isTestingEmail}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTestingEmail ? "Sending test email..." : "Send Test Email"}
        </button>

        {testResult && (
          <div className="mt-4 p-4 border rounded">
            <h3 className="font-medium mb-2">Test Result:</h3>
            <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
