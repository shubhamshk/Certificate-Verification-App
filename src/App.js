import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import VerificationResult from './components/VerificationResult';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState([]);

  // Professional analysis steps for government document verification
  const getAnalysisSteps = (file) => {
    const baseSteps = [
      { id: 1, text: 'Initializing secure connection...', icon: '🔐', duration: 1500 },
      { id: 2, text: 'Uploading document to secure server', icon: '📤', duration: 2000 },
      { id: 3, text: 'Extracting document metadata', icon: '📋', duration: 1800 },
      { id: 4, text: 'Computing SHA-256 cryptographic hash', icon: '🔢', duration: 2200 },
      { id: 5, text: 'Connecting to government database...', icon: '🏛️', duration: 2500 },
      { id: 6, text: 'Verifying document against official records', icon: '🔍', duration: 3000 },
      { id: 7, text: 'Checking blockchain immutable ledger', icon: '⛓️', duration: 3500 },
      { id: 8, text: 'Analyzing digital signatures', icon: '🛡️', duration: 2800 },
      { id: 9, text: 'Running ML-based authenticity detection', icon: '🤖', duration: 4000 },
      { id: 10, text: 'Cross-referencing with fraud database', icon: '🚫', duration: 2300 },
      { id: 11, text: 'Validating document integrity', icon: '✅', duration: 1500 },
      { id: 12, text: 'Generating verification report', icon: '📄', duration: 1800 }
    ];

    // Add file-specific steps
    if (file.type.startsWith('image/')) {
      baseSteps.splice(8, 0, 
        { id: 13, text: 'Analyzing EXIF data for tampering signs', icon: '📷', duration: 2500 },
        { id: 14, text: 'Detecting photographic manipulation', icon: '🔍', duration: 3200 }
      );
    } else if (file.type === 'application/pdf') {
      baseSteps.splice(8, 0,
        { id: 15, text: 'Validating PDF structure integrity', icon: '📑', duration: 2100 },
        { id: 16, text: 'Checking embedded certificates', icon: '🏆', duration: 2400 }
      );
    }

    return baseSteps;
  };

  // Mock analysis function - enhanced for government-grade verification
  const analyzeFile = async (file) => {
    setIsAnalyzing(true);
    setCurrentFile(file);
    setCurrentStep(0);
    
    const steps = getAnalysisSteps(file);
    setAnalysisSteps(steps);
    
    // Simulate progressive analysis steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }
    
    // Generate final result
    const mockResult = generateMockResult(file);
    setVerificationResult(mockResult);
    setIsAnalyzing(false);
  };

  // Generate mock verification results for demonstration
  const generateMockResult = (file) => {
    const fileName = file.name.toLowerCase();
    
    // Simple mock logic for demonstration
    let status, confidence, details;
    
    if (fileName.includes('fake') || fileName.includes('edited')) {
      status = 'fake';
      confidence = 0.85;
      details = [
        { name: 'Digital Signature', status: 'fail', description: 'No valid digital signature found' },
        { name: 'Metadata Analysis', status: 'fail', description: 'Suspicious editing timestamps detected' },
        { name: 'Content Integrity', status: 'fail', description: 'File shows signs of manipulation' },
        { name: 'Source Verification', status: 'fail', description: 'Unable to verify original source' }
      ];
    } else if (fileName.includes('suspicious') || Math.random() > 0.7) {
      status = 'suspicious';
      confidence = 0.65;
      details = [
        { name: 'Digital Signature', status: 'warning', description: 'Signature present but cannot be verified' },
        { name: 'Metadata Analysis', status: 'pass', description: 'Metadata appears normal' },
        { name: 'Content Integrity', status: 'warning', description: 'Minor inconsistencies detected' },
        { name: 'Source Verification', status: 'warning', description: 'Source partially verified' }
      ];
    } else {
      status = 'authentic';
      confidence = 0.92;
      details = [
        { name: 'Digital Signature', status: 'pass', description: 'Valid digital signature verified' },
        { name: 'Metadata Analysis', status: 'pass', description: 'Metadata is consistent and unmodified' },
        { name: 'Content Integrity', status: 'pass', description: 'File integrity verified' },
        { name: 'Source Verification', status: 'pass', description: 'Source authenticity confirmed' }
      ];
    }

    return {
      status,
      confidence,
      details,
      metadata: {
        'File Size': `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        'File Type': file.type,
        'Last Modified': new Date(file.lastModified).toLocaleDateString(),
        'Analysis Time': new Date().toLocaleString(),
        'Algorithm Version': '2.1.3'
      }
    };
  };

  const handleNewAnalysis = () => {
    setCurrentFile(null);
    setVerificationResult(null);
    setIsAnalyzing(false);
    setCurrentStep(0);
    setAnalysisSteps([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="gov-seal">🏛️</div>
          <h1>Government Document Verification System</h1>
          <p className="subtitle">Secure • Blockchain-Verified • AI-Powered</p>
          <p className="description">Official document authenticity verification using advanced cryptographic and machine learning technologies</p>
          <div className="security-badges">
            <span className="badge">🔒 AES-256 Encrypted</span>
            <span className="badge">⛓️ Blockchain Verified</span>
            <span className="badge">🏛️ Government Certified</span>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        {!verificationResult && !isAnalyzing && (
          <FileUpload onFileUpload={analyzeFile} />
        )}
        
        {isAnalyzing && (
          <div className="analysis-in-progress">
            <div className="analysis-header">
              <div className="analysis-spinner"></div>
              <div className="analysis-info">
                <h2>Document Verification in Progress</h2>
                <p>Performing comprehensive security analysis using government-grade verification protocols</p>
                <div className="progress-indicator">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{currentStep + 1} of {analysisSteps.length} steps</span>
                </div>
              </div>
            </div>
            <div className="analysis-steps">
              {analysisSteps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`step ${
                    index < currentStep ? 'completed' : 
                    index === currentStep ? 'active' : 
                    'pending'
                  }`}
                >
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-content">
                    <span className="step-text">{step.text}</span>
                    {index === currentStep && (
                      <div className="step-loader">
                        <div className="loader-dots">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="step-status">
                    {index < currentStep ? '✓' : index === currentStep ? '⏳' : '⏸'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {verificationResult && currentFile && (
          <VerificationResult 
            file={currentFile}
            result={verificationResult}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <p>&copy; 2024 Government Document Verification System</p>
            <p className="disclaimer">Classified: For Official Use Only | This system is monitored</p>
          </div>
          <div className="footer-section">
            <div className="security-info">
              <span>🔒 SSL/TLS Encrypted</span>
              <span>🏛️ Gov Compliant</span>
              <span>⛓️ Blockchain Secured</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
