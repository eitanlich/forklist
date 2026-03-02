"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (could send to error tracking service)
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
      </div>
      
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-base text-muted-foreground max-w-sm">
          We couldn&apos;t load this page. This might be a temporary issue.
        </p>
      </div>

      <button
        onClick={reset}
        className="group flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
      >
        <RefreshCw 
          size={18} 
          strokeWidth={2} 
          className="transition-transform duration-300 group-hover:rotate-180" 
        />
        Try again
      </button>
    </div>
  );
}
