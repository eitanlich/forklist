"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0908] text-[#F5F1EA] font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" strokeWidth={1.5} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h2>
            <p className="text-base text-[#9A8A78] max-w-sm">
              We couldn&apos;t load the app. Please try again.
            </p>
          </div>

          <button
            onClick={reset}
            className="group flex items-center gap-2 rounded-2xl bg-[#D4A574] px-6 py-3 text-base font-medium text-[#0A0908] transition-all duration-300 hover:opacity-90"
          >
            <RefreshCw 
              size={18} 
              strokeWidth={2} 
              className="transition-transform duration-300 group-hover:rotate-180" 
            />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
