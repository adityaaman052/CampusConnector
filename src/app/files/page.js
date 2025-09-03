'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase'; // Adjust the import path as needed
import { v4 as uuidv4 } from 'uuid';

export default function FileUploadPage() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first');

    setUploading(true);
    try {
      const fileRef = ref(storage, `uploads/${uuidv4()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      setUrl(downloadURL);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📈';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥';
      case 'mp3':
      case 'wav': return '🎵';
      case 'zip':
      case 'rar': return '🗜️';
      default: return '📁';
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📁</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">File Upload</h1>
                <p className="text-gray-600 text-sm">Upload notes, posters, and documents for the campus community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Files</h2>
            <p className="text-gray-600">Share study materials, event posters, and other helpful documents</p>
          </div>

          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-green-400 bg-green-50' 
                : file 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your file here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse from your computer
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar,.txt"
                />
                <div className="text-sm text-gray-500">
                  Supported formats: PDF, DOC, XLS, PPT, Images, Videos, Audio, Archives
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl">{getFileIcon(file.name)}</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">File Selected</h3>
                  <p className="text-gray-700 font-medium">{file.name}</p>
                  <p className="text-gray-500 text-sm">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={resetUpload}
                  className="text-gray-600 hover:text-gray-900 text-sm underline"
                >
                  Choose different file
                </button>
              </div>
            )}
          </div>

          {/* File Details & Actions */}
          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={resetUpload}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Upload File</span>
                        <span>📤</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {uploading && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success State */}
          {url && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">File Uploaded Successfully!</h3>
                  <p className="text-green-800 text-sm mb-3">
                    Your file has been uploaded and is now accessible via the link below:
                  </p>
                  <div className="bg-white border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-3">
                        <p className="text-sm text-gray-600 mb-1">File URL:</p>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-sm break-all underline"
                        >
                          {url}
                        </a>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={resetUpload}
                    className="mt-3 text-green-700 hover:text-green-800 text-sm font-medium"
                  >
                    Upload Another File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guidelines Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">📋</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Maximum file size: 10MB per file</li>
                <li>• Ensure files are relevant to campus activities</li>
                <li>• Use descriptive filenames for easy identification</li>
                <li>• Check file permissions before sharing sensitive content</li>
                <li>• Report any inappropriate content to administrators</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Supported Formats Card */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Supported File Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700 mb-1">Documents</p>
              <p className="text-gray-600">PDF, DOC, DOCX, TXT</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Spreadsheets</p>
              <p className="text-gray-600">XLS, XLSX, CSV</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Presentations</p>
              <p className="text-gray-600">PPT, PPTX</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Media</p>
              <p className="text-gray-600">JPG, PNG, GIF, MP4, MP3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}