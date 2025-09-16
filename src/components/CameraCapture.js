import React, { useRef, useState, useCallback, useEffect } from 'react';
import './CameraCapture.css';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Get available cameras
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Prefer back camera if available
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      setSelectedDeviceId(backCamera ? backCamera.deviceId : videoDevices[0]?.deviceId);
    } catch (err) {
      console.error('Error getting devices:', err);
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async (deviceId = selectedDeviceId) => {
    try {
      setError(null);
      setIsVideoReady(false);
      
      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: deviceId ? undefined : { ideal: 'environment' },
          deviceId: deviceId ? { exact: deviceId } : undefined
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        const handleVideoReady = () => {
          setIsVideoReady(true);
          videoRef.current.removeEventListener('loadedmetadata', handleVideoReady);
        };
        
        videoRef.current.addEventListener('loadedmetadata', handleVideoReady);
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'Please check your camera settings and try again.';
      }
      
      setError(errorMessage);
    }
  }, [selectedDeviceId, stream]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture photo with enhanced quality
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      setError('Camera is not ready. Please wait a moment and try again.');
      return;
    }

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set high-quality canvas dimensions
    const aspectRatio = video.videoWidth / video.videoHeight;
    const maxWidth = 2048;
    const maxHeight = 2048;
    
    let captureWidth = video.videoWidth;
    let captureHeight = video.videoHeight;
    
    // Scale down if too large while maintaining aspect ratio
    if (captureWidth > maxWidth) {
      captureWidth = maxWidth;
      captureHeight = maxWidth / aspectRatio;
    }
    
    if (captureHeight > maxHeight) {
      captureHeight = maxHeight;
      captureWidth = maxHeight * aspectRatio;
    }
    
    canvas.width = captureWidth;
    canvas.height = captureHeight;

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, captureWidth, captureHeight);

    // Convert to blob with high quality
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Create a file from the blob with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `certificate-scan-${timestamp}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          onCapture(file);
          stopCamera();
          onClose();
        } else {
          setError('Failed to capture image. Please try again.');
        }
        setIsCapturing(false);
      },
      'image/jpeg',
      0.95 // Higher quality
    );
  }, [onCapture, onClose, stopCamera, isVideoReady]);

  // Initialize camera when component mounts
  useEffect(() => {
    const initCamera = async () => {
      await getDevices();
    };
    
    initCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [getDevices, stopCamera]);
  
  // Start camera when device is selected or devices are available
  useEffect(() => {
    if (selectedDeviceId || (devices.length > 0 && !selectedDeviceId)) {
      startCamera(selectedDeviceId);
    }
  }, [selectedDeviceId, devices.length, startCamera]);

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
                className={`camera-video ${isVideoReady ? 'ready' : 'loading'}`}
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {!isVideoReady && !error && (
                <div className="camera-loading">
                  <div className="camera-loading-spinner"></div>
                  <p>Starting camera...</p>
                </div>
              )}
              
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
                <li>Fill the frame with document</li>
              </ul>
              
              {devices.length > 1 && (
                <div className="camera-selector">
                  <label htmlFor="camera-select">Camera:</label>
                  <select 
                    id="camera-select"
                    value={selectedDeviceId || ''}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="camera-select"
                  >
                    {devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="capture-controls">
              <button 
                className="capture-btn" 
                onClick={capturePhoto}
                disabled={isCapturing || !isVideoReady}
              >
                {isCapturing ? (
                  <>
                    <div className="capture-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    📸 {isVideoReady ? 'Capture Certificate' : 'Camera Starting...'}
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
