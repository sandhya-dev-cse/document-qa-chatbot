"use client";

import { useState } from "react";

const API_URL ="https://document-qa-chatbot-2-1yqo.onrender.com";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadDocument = async () => {
    if (!file) {
      setUploadMessage("Please select a document first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadMessage("Uploading...");

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setUploadMessage("Document uploaded successfully!");
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "Upload failed"
      );
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      setAnswer("Please enter a question.");
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to get answer");
      }

      setAnswer(data.answer);
    } catch (error) {
      setAnswer(
        error instanceof Error ? error.message : "Unable to get answer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Document Q&A Chatbot
          </h1>

          <p className="mt-2 text-gray-600">
            Upload a document and ask questions about its content.
          </p>
        </div>

        {/* Upload Section */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="mb-5 text-2xl font-bold text-black">
            Upload Document
          </h2>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-black">
              Choose a file
            </label>

            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full cursor-pointer rounded-lg border border-gray-400 bg-white p-3 text-black file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-blue-700"
            />

            {file && (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-black">
                  Selected file:
                </p>

                <p className="mt-1 break-all text-sm text-gray-700">
                  {file.name}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={uploadDocument}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Upload Document
          </button>

          {uploadMessage && (
            <p className="mt-4 font-medium text-gray-800">
              {uploadMessage}
            </p>
          )}
        </section>

        {/* Question Section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <h2 className="mb-5 text-2xl font-bold text-black">
            Ask a Question
          </h2>

          <label className="mb-2 block text-sm font-semibold text-black">
            Your question
          </label>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your document..."
            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-3 text-black outline-none placeholder:text-gray-500 focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />

          <button
            onClick={askQuestion}
            disabled={loading}
            className="mt-5 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Ask Question"}
          </button>

          {/* Display Question */}
          {question && !loading && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="mb-2 text-lg font-bold text-black">
                Your Question
              </h3>

              <p className="whitespace-pre-wrap text-gray-800">
                {question}
              </p>
            </div>
          )}

          {/* Answer */}
          {answer && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-bold text-black">
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