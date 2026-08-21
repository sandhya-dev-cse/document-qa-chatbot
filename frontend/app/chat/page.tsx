"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://document-qa-chatbot-secc.onrender.com";

export default function ChatPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [documentName, setDocumentName] = useState("");

useEffect(() => {
  const name = localStorage.getItem("documentName");

  if (name) {
    setDocumentName(name);
  }
}, []);

  const askQuestion = async () => {
  if (!question.trim()) {
    setAnswer("Please enter a question.");
    return;
  }

  const documentId = localStorage.getItem("documentId");

  if (!documentId) {
    setAnswer("No document selected. Please go back to the dashboard.");
    return;
  }

  try {
    setLoading(true);
    setAnswer("");

    const response = await fetch(`${API_URL}/qa/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
        document_id: documentId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Unable to get answer");
    }

    setAnswer(data.answer);
  } catch (error) {
    setAnswer(
      error instanceof Error
        ? error.message
        : "Unable to get answer"
    );
  } finally {
    setLoading(false);
  }
};

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("documentId");
    localStorage.removeItem("documentName");

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Document Chat
            </h1>

            <p className="mt-1 text-gray-600">
              Ask questions about your uploaded document.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={goToDashboard}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Dashboard
            </button>

            <button
              onClick={logout}
              className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white transition hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Document Information */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              📄
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Document
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {documentName || "Uploaded document"}
              </p>
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">

          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            Ask a Question
          </h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about your document..."
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={askQuestion}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask Question"}
          </button>

          {/* Answer */}
          {answer && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                Answer
              </h3>

              <p className="whitespace-pre-wrap leading-7 text-gray-800">
                {answer}
              </p>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}