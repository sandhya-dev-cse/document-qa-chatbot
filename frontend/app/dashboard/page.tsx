"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://document-qa-chatbot-2-1yqo.onrender.com";

export default function DashboardPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async () => {
    if (!file) {
      setUploadMessage("Please select a document first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setUploadMessage("Uploading document...");

      const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setUploadMessage("Document uploaded successfully!");

      // Store document information
      localStorage.setItem("documentId", data.document_id);
      localStorage.setItem("documentName", data.filename);

    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const openChat = () => {
    router.push("/chat");
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
              Dashboard
            </h1>

            <p className="mt-1 text-gray-600">
              Upload a document to start asking questions.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Logout
          </button>
        </div>

        {/* Upload Card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Upload Document
            </h2>

            <p className="mt-2 text-gray-600">
              Supported formats: PDF and TXT
            </p>
          </div>

          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">

            <label className="cursor-pointer">
              <div className="mb-4 text-4xl">
                📄
              </div>

              <p className="font-semibold text-gray-800">
                Choose a document
              </p>

              <p className="mt-1 text-sm text-gray-500">
                PDF or TXT files
              </p>

              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-800">
                  Selected file
                </p>

                <p className="mt-1 break-all text-sm text-gray-600">
                  {file.name}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={uploadDocument}
            disabled={uploading}
            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>

          {uploadMessage && (
            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-center font-medium text-gray-800">
              {uploadMessage}
            </p>
          )}

          {/* Chat button */}
          {file && uploadMessage === "Document uploaded successfully!" && (
            <button
              onClick={openChat}
              className="mt-4 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Open Document Chat →
            </button>
          )}

        </section>
      </div>
    </main>
  );
}