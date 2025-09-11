import React, { useRef, useState, useCallback } from 'react';
import './CameraCapture.css';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment' // Use back camera on mobile
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Create a file from the blob
          const file = new File([blob], 'certificate-scan.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          onCapture(file);
          stopCamera();
          onClose();
        }
        setIsCapturing(false);
      },
      'image/jpeg',
      0.9
    );
  }, [onCapture, onClose, stopCamera]);

  // Start camera when component mounts
  React.useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="camera-overlay">
      <div className="camera-container">
        <div className="camera-header">
          <h3>📷 Scan Certificate</h3>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className="camera-content">
          {error ? (
            <div className="camera-error">
              <div className="error-icon">📷</div>
              <p>{error}</p>
              <button onClick={startCamera} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : (
            <div className="camera-view">
              <video
                ref={videoRef}
                className="camera-video"
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* Camera overlay with guidelines */}
              <div className="camera-overlay-guide">
                <div className="scan-area">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                  <div className="scan-text">
                    Position certificate within the frame
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {!error && (
          <div className="camera-controls">
            <div className="camera-tips">
              <p>💡 Tips:</p>
              <ul>
                <li>Ensure good lighting</li>
                <li>Hold device steady</li>
                <li>Place certificate flat</li>
                <li>Avoid shadows and glare</li>
              </ul>
            </div>
            
            <div className="capture-controls">
              <button 
                className="capture-btn" 
                onClick={capturePhoto}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <>
                    <div className="capture-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    📸 Capture Certificate
                  </>
                )}
              </button>
              
              <button className="cancel-btn" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
