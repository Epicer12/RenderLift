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
        "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all relative overflow-hidden",
        isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-neutral-700 hover:border-gray-400",
        uploading && "opacity-90 cursor-not-allowed border-blue-400"
      )}
    >
      {/* Progress Bar Background */}
      {uploading && (
        <div
          className="absolute bottom-0 left-0 h-2 bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      )}

      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-700">
                {progress}%
              </span>
            </div>
          </div>
        ) : status === 'success' ? (
          <CheckCircle className="w-12 h-12 text-green-500" />
        ) : status === 'error' ? (
          <AlertCircle className="w-12 h-12 text-red-500" />
        ) : (
          <UploadCloud className={clsx("w-12 h-12", isDragActive ? "text-blue-500" : "text-gray-400")} />
        )}

        <div className="space-y-1">
          {uploading ? (
            <p className="text-blue-500 font-medium">Uploading to Drive... {progress}%</p>
          ) : status === 'success' ? (
            <p className="text-green-500 font-medium">{message}</p>
          ) : status === 'error' ? (
            <p className="text-red-500 font-medium">{message}</p>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {isDragActive ? "Drop the .blend file here" : "Drag 'n' drop your .blend file here"}
              </p>
              <p className="text-sm text-gray-500">or click to select files</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

