"use client"
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { useSession } from 'next-auth/react'

interface UploadProps {
  onUploadComplete?: (file: { id: string, name: string }) => void
}

const CHUNK_SIZE = 8 * 1024 * 1024 // Drive requires a multiple of 256 KiB
const MAX_RETRIES = 5

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Resolves with the finished request whatever its status; rejects only on network failure
function sendToDrive(uploadUrl: string, body: Blob | null, contentRange: string, contentType: string, onProgress?: (loaded: number) => void) {
  return new Promise<XMLHttpRequest>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl, true)
    xhr.setRequestHeader('Content-Range', contentRange)
    // CRITICAL: Must match the X-Upload-Content-Type set in the API
    if (body) xhr.setRequestHeader('Content-Type', contentType)
    if (onProgress) {
      xhr.upload.onprogress = (e) => onProgress(e.loaded)
    }
    xhr.onload = () => resolve(xhr)
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(body)
  })
}

// Uploads the file to a Drive resumable session in chunks. After a dropped connection
// it asks Drive how much it already has and continues from there.
async function uploadInChunks(uploadUrl: string, file: File, onProgress: (bytes: number) => void) {
  const contentType = file.type || 'application/octet-stream'
  let offset = 0
  let checkStatus = false
  let failures = 0

  while (true) {
    const start = offset
    let xhr: XMLHttpRequest | null = null
    try {
      if (checkStatus) {
        xhr = await sendToDrive(uploadUrl, null, `bytes */${file.size}`, contentType)
      } else {
        const end = Math.min(start + CHUNK_SIZE, file.size)
        xhr = await sendToDrive(uploadUrl, file.slice(start, end), `bytes ${start}-${end - 1}/${file.size}`, contentType, loaded => onProgress(start + loaded))
      }
    } catch {
      xhr = null
    }

    if (xhr && (xhr.status === 200 || xhr.status === 201)) {
      return JSON.parse(xhr.responseText)
    }

    if (xhr && xhr.status === 308) {
      // "Range: bytes=0-12345" is what Drive has stored so far; no header means nothing yet
      const range = xhr.getResponseHeader('Range')
      offset = range ? parseInt(range.split('-')[1], 10) + 1 : 0
      onProgress(offset)
      const wasStatusCheck = checkStatus
      checkStatus = false
      if (offset > start) failures = 0
      if (offset > start || wasStatusCheck) continue
      // A chunk was sent but Drive stored none of it: count it as a failure so we can't loop forever
    } else if (xhr && xhr.status > 0 && xhr.status < 500) {
      // 4xx: the upload session expired or was rejected; retrying won't help
      console.error('Drive Upload Error', xhr.responseText)
      throw new Error(`Upload failed (${xhr.status}). Please try again.`)
    }

    if (++failures > MAX_RETRIES) {
      throw new Error('Network error during upload. Check your connection and try again.')
    }
    await wait(1000 * 2 ** failures)
    checkStatus = true
  }
}

export function Upload({ onUploadComplete }: UploadProps) {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!session) {
      setStatus('error')
      setMessage('Please sign in first')
      return
    }

    const file = acceptedFiles[0]
    if (!file) return
    if (file.size === 0) {
      setStatus('error')
      setMessage('That file is empty')
      return
    }

    setUploading(true)
    setProgress(0)
    setStatus('idle')
    setMessage('')

    try {
      // 1. Get Resumable Upload URL from our backend
      const initRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type || 'application/octet-stream', // fallback
          size: file.size
        }),
      })

      const initData = await initRes.json()
      if (!initRes.ok) throw new Error(initData.error || 'Failed to start upload')

      const uploadUrl = initData.uploadUrl

      // 2. Upload directly to Google Drive in resumable chunks
      const result = await uploadInChunks(uploadUrl, file, bytes => {
        setProgress(Math.round((bytes / file.size) * 100))
      })

      setStatus('success')
      setMessage('Upload complete!')

      if (onUploadComplete) {
        // The Drive API Resumable Upload response structure
        // It returns the file metadata
        onUploadComplete({ id: result.id, name: result.name })
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setStatus('error')
      setMessage(error.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [session, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-blender': ['.blend'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'] // Windows reports zips with this type
    },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "swiss-border p-12 text-left cursor-pointer transition-all relative overflow-hidden bg-surface",
        isDragActive ? "border-accent" : "border-border-subtle hover:border-foreground-muted",
        uploading && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Percentage Overlay (Mono) */}
      {uploading && (
        <div className="absolute top-4 right-4 mono text-[13px] text-accent font-black tracking-widest">
          SYNCING_DRIVE: {progress}%
        </div>
      )}

      <input {...getInputProps()} />
      <div className="flex flex-col items-start gap-6">
        <div className="flex items-center gap-4">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : status === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <UploadCloud className={clsx("w-5 h-5", isDragActive ? "text-accent" : "text-foreground-muted")} />
          )}
          <span className="text-[13px] mono text-foreground-muted uppercase tracking-[0.2em]">
            {uploading ? "Operation in progress" : status === 'success' ? "Operation successful" : "Source selection"}
          </span>
        </div>

        <div className="space-y-2">
          {uploading ? (
            <div className="space-y-4 w-full min-w-[300px]">
              <p className="text-xl font-bold uppercase tracking-tight">Uploading Assets...</p>
              <div className="w-full h-[2px] bg-border-subtle relative overflow-hidden">
                <div
                  className="absolute h-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : status === 'success' ? (
            <p className="text-xl font-bold uppercase tracking-tight text-green-500">{message}</p>
          ) : status === 'error' ? (
            <p className="text-xl font-bold uppercase tracking-tight text-red-500">{message}</p>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight">
                {isDragActive ? "Release to initialize" : "Select or drop .blend or .zip file"}
              </p>
              <p className="text-[15px] mono text-foreground-muted uppercase tracking-widest">
                Max file size: 2GB • Format: .blend, or .zip with textures
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

