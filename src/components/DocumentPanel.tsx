import { useState } from 'react'
import { uploadPdf } from '../api/client'
import type { DocumentStatus } from '../types'

interface DocumentPanelProps {
  documentStatus: DocumentStatus | null
  onUploaded: (status: DocumentStatus) => void
}

export function DocumentPanel({ documentStatus, onUploaded }: DocumentPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadPdf(selectedFile)
      onUploaded({
        filename: result.filename,
        totalPages: result.total_pages,
        totalChunks: result.total_chunks,
      })
      setSelectedFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold text-gray-900">Document</h2>

      {documentStatus ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p className="font-medium">{documentStatus.filename}</p>
          <p>{documentStatus.totalPages} pages &middot; {documentStatus.totalChunks} chunks</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No document uploaded yet. Upload an insurance PDF to start chatting.</p>
      )}

      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? 'Uploading…' : documentStatus ? 'Replace document' : 'Upload document'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
