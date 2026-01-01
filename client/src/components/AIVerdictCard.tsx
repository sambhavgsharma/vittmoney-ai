"use client";

import { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import { safeLocalStorage } from "@/lib/safeLocalStorage";

export default function AIVerdictCard() {
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setVerdict(null);

    try {
      const token = safeLocalStorage.get("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

      const response = await fetch(`${apiBase}/ai/verdict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: "Why am I overspending this month?",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to get verdict");
      }

      const data = await response.json();
      setVerdict(data.verdict);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🤖 AI Verdict
        </h3>

        {verdict ? (
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {verdict}
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        ) : null}

        {!verdict && !error && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get AI insights on your spending patterns and personalized suggestions.
          </p>
        )}

        <Button
          onClick={handleAnalyze}
          variant="primary"
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
          {...(loading && { disabled: true })}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></span>
              Analyzing...
            </div>
          ) : (
            "Analyze my spending"
          )}
        </Button>
      </div>
    </Card>
  );
}
