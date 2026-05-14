import { useState } from 'react'
import { api } from '../lib/api'

export default function ImageUpload({ onUploadSuccess, currentImage }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || '')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const { data } = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      onUploadSuccess(data.url)
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || 'Unknown error'))
      setPreview(currentImage || '')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
      <div className="flex items-start gap-4">
        {preview && (
          <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          )}
          <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
        </div>
      </div>
    </div>
  )
}