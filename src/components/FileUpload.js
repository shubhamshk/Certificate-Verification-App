import React, { useState, useCallback } from 'react';
import CameraCapture from './CameraCapture';
import './FileUpload.css';

const FileUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Validate and process file upload
  const handleFileUpload = useCallback(async (file) => {
    // File size validation (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // File type validation for certificates
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported. Please upload certificate images (JPG, PNG), PDFs, or Word documents.');
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

  const handleCameraCapture = (file) => {
    handleFileUpload(file);
    setShowCamera(false);
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  const closeCamera = () => {
    setShowCamera(false);
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
            <div className="upload-icon">🏆</div>
            <p className="upload-text">
              <strong>CERTIFICATE FRAUD DETECTION</strong><br/>
              Upload your certificate for authenticity verification
            </p>
            
            <div className="upload-options">
              <div className="upload-option">
                <label className="file-input-label">
                  📎 Upload from Device
                  <input
                    type="file"
                    className="file-input"
                    onChange={handleChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
              </div>
              
              <div className="upload-divider">
                <span>OR</span>
              </div>
              
              <div className="upload-option">
                <button className="camera-btn" onClick={openCamera}>
                  📷 Scan Certificate
                </button>
              </div>
            </div>
            
            <p className="upload-subtitle">
              ✓ AI-Powered Detection • ✓ Blockchain Verified • ✓ Anti-Fraud System
            </p>
            <p className="upload-subtitle">
              Supported: Educational Certificates, Professional Licenses, Government IDs, PDFs
            </p>
            <p className="upload-limit">🔒 Maximum file size: 10MB • All scans are encrypted and securely processed</p>
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
      
      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={closeCamera}
        />
      )}
    </div>
  );
};

export default FileUpload;
