import React from 'react';
import './VerificationResult.css';

const VerificationResult = ({ file, result, onNewAnalysis }) => {
  if (!result) return null;

  const getResultIcon = (status) => {
    switch (status) {
      case 'authentic':
        return '✅';
      case 'fake':
        return '❌';
      case 'suspicious':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getResultColor = (status) => {
    switch (status) {
      case 'authentic':
        return '#38a169';
      case 'fake':
        return '#e53e3e';
      case 'suspicious':
        return '#d69e2e';
      default:
        return '#718096';
    }
  };

  const getResultMessage = (status) => {
    switch (status) {
      case 'authentic':
        return 'This file appears to be authentic and has not been tampered with.';
      case 'fake':
        return 'This file shows signs of manipulation or forgery.';
      case 'suspicious':
        return 'This file has some suspicious characteristics that require further investigation.';
      default:
        return 'Unable to determine authenticity.';
    }
  };

  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="verification-result">
      <div className="result-header">
        <h2>Verification Results</h2>
        <div className="file-info-summary">
          <span className="file-name">{file.name}</span>
          <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
        </div>
      </div>

      <div className="result-card">
        <div className="result-status" style={{ color: getResultColor(result.status) }}>
          <div className="status-icon">{getResultIcon(result.status)}</div>
          <div className="status-text">
            <h3>{result.status.charAt(0).toUpperCase() + result.status.slice(1)}</h3>
            <p>{getResultMessage(result.status)}</p>
          </div>
        </div>

        <div className="confidence-meter">
          <div className="confidence-label">
            <span>Confidence Level</span>
            <span className="confidence-value">{formatConfidence(result.confidence)}</span>
          </div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill"
              style={{ 
                width: `${result.confidence * 100}%`,
                backgroundColor: getResultColor(result.status)
              }}
            ></div>
          </div>
        </div>

        <div className="analysis-details">
          <h4>Analysis Details</h4>
          <div className="details-grid">
            {result.details.map((detail, index) => (
              <div key={index} className="detail-item">
                <div className="detail-icon">
                  {detail.status === 'pass' ? '✅' : detail.status === 'fail' ? '❌' : '⚠️'}
                </div>
                <div className="detail-content">
                  <span className="detail-name">{detail.name}</span>
                  <span className="detail-description">{detail.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {result.metadata && (
          <div className="metadata-section">
            <h4>File Metadata</h4>
            <div className="metadata-grid">
              {Object.entries(result.metadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-key">{key}:</span>
                  <span className="metadata-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="result-actions">
          <button className="analyze-again-btn" onClick={onNewAnalysis}>
            Analyze Another File
          </button>
          <button className="download-report-btn" onClick={() => downloadReport(file, result)}>
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Function to download verification report as JSON
const downloadReport = (file, result) => {
  const report = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    analysisDate: new Date().toISOString(),
    verificationResult: result
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { 
    type: 'application/json' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `verification-report-${file.name.split('.')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default VerificationResult;
