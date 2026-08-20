"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://document-qa-chatbot-secc.onrender.com";

interface DocumentItem {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // =========================
  // LOAD DOCUMENTS
  // =========================

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);

      const response = await fetch(`${API_URL}/documents/`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load documents"
        );
      }

      setDocuments(data.documents || []);

    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // =========================
  // UPLOAD DOCUMENT
  // =========================

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

      const response = await fetch(
        `${API_URL}/documents/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Upload failed"
        );
      }

      setUploadMessage(
        "Document uploaded successfully!"
      );

      setFile(null);

      // Reload documents from MongoDB
      await loadDocuments();

    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // OPEN DOCUMENT
  // =========================

  const openDocument = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>

            <p className="mt-1 text-gray-600">
              Upload and manage your documents.
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

        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-md">

          <h2 className="text-2xl font-bold text-gray-900">
            Upload Document
          </h2>

          <p className="mt-2 text-gray-600">
            Supported formats: PDF and TXT
          </p>

          <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">

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
                  setFile(
                    e.target.files?.[0] || null
                  )
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

          {/* Upload button */}

          <button
            onClick={uploadDocument}
            disabled={uploading}
            className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : "Upload Document"}
          </button>

          {uploadMessage && (
            <p className="mt-4 rounded-lg bg-gray-50 p-3 text-center font-medium text-gray-800">
              {uploadMessage}
            </p>
          )}

        </section>

        {/* Documents */}

        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-900">
              My Documents
            </h2>

            <p className="mt-1 text-gray-600">
              Your uploaded documents
            </p>

          </div>

          {loadingDocuments ? (

            <div className="py-10 text-center text-gray-500">
              Loading documents...
            </div>

          ) : documents.length === 0 ? (

            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">

              <div className="text-4xl">
                📂
              </div>

              <p className="mt-3 font-semibold text-gray-700">
                No documents yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Upload your first document above.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {documents.map((document) => (

                <button
                  key={document.id}
                  onClick={() =>
                    openDocument(document.id)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                        📄
                      </div>

                      <div>

                        <p className="font-semibold text-gray-900">
                          {document.filename}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {document.content_type}
                        </p>

                      </div>

                    </div>

                    <span className="text-sm font-semibold text-blue-600">
                      Open →
                    </span>

                  </div>

                </button>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}