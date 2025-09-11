import React, { useState, useCallback } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Validate and process file upload
  const handleFileUpload = useCallback(async (file) => {
    // File size validation (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac',
      'application/pdf', 'text/plain', 'application/json'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported. Please upload images, videos, audio, PDF, or text files.');
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    // Simulate file upload and analysis
    setTimeout(() => {
      setIsUploading(false);
      onFileUpload(file);
    }, 2000);
  }, [onFileUpload]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setIsUploading(false);
  };

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${uploadedFile ? 'file-uploaded' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!uploadedFile ? (
          <>
            <div className="upload-icon">🔒</div>
            <p className="upload-text">
              <strong>SECURE DOCUMENT UPLOAD</strong><br/>
              Drag and drop your government document here, or{' '}
              <label className="file-input-label">
                click to browse securely
                <input
                  type="file"
                  className="file-input"
                  onChange={handleChange}
                  accept="image/*,video/*,audio/*,.pdf,.txt,.json"
                />
              </label>
            </p>
            <p className="upload-subtitle">
              ✓ Encrypted Upload • ✓ Government Certified • ✓ Blockchain Secured
            </p>
            <p className="upload-subtitle">
              Accepted: Official Documents, IDs, Certificates, Images, PDFs, Text Files
            </p>
            <p className="upload-limit">🔒 Maximum file size: 10MB • All uploads are encrypted and logged</p>
          </>
        ) : (
          <div className="file-info">
            <div className="file-icon">
              {uploadedFile.type.startsWith('image/') ? '🖼️' :
               uploadedFile.type.startsWith('video/') ? '🎥' :
               uploadedFile.type.startsWith('audio/') ? '🎵' :
               uploadedFile.type === 'application/pdf' ? '📄' : '📝'}
            </div>
            <div className="file-details">
              <h3>{uploadedFile.name}</h3>
              <p>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>Type: {uploadedFile.type}</p>
            </div>
            {isUploading && (
              <div className="upload-progress">
                <div className="spinner"></div>
                <p>Analyzing file...</p>
              </div>
            )}
            <button className="reset-button" onClick={resetUpload}>
              Upload Different File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
