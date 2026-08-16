"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setDocuments((previous) => [...previous, file.name]);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-slate-950">
              📄
            </div>

            <span className="text-lg font-semibold">
              DocumentAI
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">

        {/* Sidebar */}
        <aside className="hidden w-72 border-r border-white/10 p-5 md:block">

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-300">
              Documents
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Upload documents to ask questions.
            </p>
          </div>

          {/* Upload */}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            <span>＋</span>
            Upload document

            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
          </label>

          {/* Document list */}
          <div className="mt-6 space-y-2">

            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-600">
                No documents uploaded yet.
              </div>
            ) : (
              documents.map((document, index) => (
                <button
                  key={`${document}-${index}`}
                  onClick={() => setSelectedDocument(document)}
                  className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                    selectedDocument === document
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>📄</span>

                    <span className="truncate">
                      {document}
                    </span>
                  </div>
                </button>
              ))
            )}

          </div>
        </aside>

        {/* Main content */}
        <section className="flex flex-1 flex-col">

          {/* Welcome */}
          <div className="flex flex-1 flex-col items-center justify-center px-6">

            <div className="mb-8 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                ✨
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Ask your documents
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                Upload a document and ask questions about its contents.
                Your AI assistant will help you find the information you need.
              </p>

            </div>

            {/* Selected document */}
            {selectedDocument && (
              <div className="mb-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                📄 {selectedDocument}
              </div>
            )}

            {/* Question box */}
            <div className="w-full max-w-2xl">

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl">

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about your document..."
                  rows={3}
                  className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />

                <div className="flex items-center justify-between border-t border-white/10 px-2 pt-2">

                  <span className="px-2 text-xs text-slate-600">
                    AI-powered document Q&A
                  </span>

                  <button
                    disabled={!question.trim()}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Ask
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}