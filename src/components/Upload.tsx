"use client"
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { useSession } from 'next-auth/react'

interface UploadProps {
  onUploadComplete?: (file: { id: string, name: string }) => void
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
          type: file.type || 'application/octet-stream' // fallback
        }),
      })

      const initData = await initRes.json()
      if (!initRes.ok) throw new Error(initData.error || 'Failed to start upload')

      const uploadUrl = initData.uploadUrl

      // 2. Perform Direct Upload to Google Drive
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl, true)

      // CRITICAL: Must match the X-Upload-Content-Type set in the API
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setProgress(Math.round(percentComplete))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const result = JSON.parse(xhr.responseText)
          setStatus('success')
          setMessage('Upload complete!')
          console.log('Drive Result:', result)

          if (onUploadComplete) {
            // The Drive API Resumable Upload response structure
            // It returns the file metadata
            onUploadComplete({ id: result.id, name: result.name })
          }

        } else {
          setStatus('error')
          setMessage('Upload failed during transfer')
          console.error('Drive Upload Error', xhr.responseText)
        }
        setUploading(false)
      }

      xhr.onerror = () => {
        setStatus('error')
        setMessage('Network error during upload')
        setUploading(false)
      }

      xhr.send(file)

    } catch (error: any) {
      console.error('Upload init error:', error)
      setStatus('error')
      setMessage(error.message || 'Upload initialization failed')
      setUploading(false)
    }
  }, [session, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-blender': ['.blend'],
      'application/zip': ['.zip']
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
                {isDragActive ? "Release to initialize" : "Select or drop .blend file"}
              </p>
              <p className="text-[15px] mono text-foreground-muted uppercase tracking-widest">
                Max file size: 2GB • Format: .blend
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

