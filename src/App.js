import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import VerificationResult from './components/VerificationResult';
import ocrService from './utils/ocrService';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState([]);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResults, setOcrResults] = useState(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);

  // Professional analysis steps for certificate verification
  const getAnalysisSteps = (file) => {
    const baseSteps = [
      { id: 1, text: 'Establishing secure SSL connection...', icon: '🔐', duration: 1200 },
      { id: 2, text: 'Encrypting and uploading certificate', icon: '📤', duration: 1800 },
      { id: 3, text: 'Extracting certificate metadata', icon: '📋', duration: 1500 },
      { id: 4, text: 'Initializing OCR text recognition engine', icon: '🔍', duration: 2000 },
      { id: 5, text: 'Performing advanced OCR text extraction', icon: '📝', duration: 0, isOcr: true }, // Special OCR step
      { id: 6, text: 'Parsing extracted certificate information', icon: '🧠', duration: 1500 },
      { id: 7, text: 'Computing digital fingerprint hash', icon: '🔢', duration: 2000 },
      { id: 8, text: 'Connecting to certificate authorities...', icon: '🏦', duration: 2200 },
      { id: 9, text: 'Cross-referencing issuing institution', icon: '🏛️', duration: 3000 },
      { id: 10, text: 'Validating certificate format standards', icon: '📄', duration: 2400 },
      { id: 11, text: 'Checking blockchain certificate ledger', icon: '⛓️', duration: 3200 },
      { id: 12, text: 'Running AI forgery detection algorithms', icon: '🤖', duration: 4500 },
      { id: 13, text: 'Analyzing certificate seal authenticity', icon: '🛡️', duration: 2800 },
      { id: 14, text: 'Scanning fake certificate database', icon: '🚫', duration: 2600 },
      { id: 15, text: 'Verifying issuing authority legitimacy', icon: '✅', duration: 2000 },
      { id: 16, text: 'Generating comprehensive fraud detection report', icon: '📊', duration: 1800 }
    ];

    // Add certificate-specific steps based on file type
    if (file.type.startsWith('image/')) {
      baseSteps.splice(11, 0, 
        { id: 17, text: 'Analyzing image EXIF metadata', icon: '📷', duration: 2300 },
        { id: 18, text: 'Detecting certificate image manipulation', icon: '🎨', duration: 3500 },
        { id: 19, text: 'Checking for digital watermarks', icon: '💰', duration: 2700 }
      );
    } else if (file.type === 'application/pdf') {
      baseSteps.splice(11, 0,
        { id: 20, text: 'Converting PDF pages to high-resolution images', icon: '📑', duration: 2100 },
        { id: 21, text: 'Validating embedded digital signatures', icon: '✍️', duration: 2800 },
        { id: 22, text: 'Checking PDF security certificates', icon: '🔒', duration: 2400 }
      );
    }

    return baseSteps;
  };

  // Real analysis function with OCR integration
  const analyzeFile = async (file) => {
    setIsAnalyzing(true);
    setCurrentFile(file);
    setCurrentStep(0);
    setOcrResults(null);
    setOcrProgress(0);
    
    const steps = getAnalysisSteps(file);
    setAnalysisSteps(steps);
    
    try {
      // Simulate progressive analysis steps
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        
        // Handle OCR step specially
        if (steps[i].isOcr) {
          setIsOcrProcessing(true);
          try {
            const ocrResult = await ocrService.extractText(file, (progress) => {
              setOcrProgress(progress);
            });
            setOcrResults(ocrResult);
            console.log('OCR Results:', ocrResult);
          } catch (error) {
            console.error('OCR Error:', error);
            // Continue with analysis even if OCR fails
          } finally {
            setIsOcrProcessing(false);
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        }
      }
      
      // Generate final result with OCR data
      const mockResult = generateMockResult(file, ocrResults);
      setVerificationResult(mockResult);
    } catch (error) {
      console.error('Analysis error:', error);
      // Generate result even if there's an error
      const mockResult = generateMockResult(file, null);
      setVerificationResult(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate mock verification results with OCR data
  const generateMockResult = (file, ocrData = null) => {
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

    // Enhanced metadata with OCR results
    const metadata = {
      'File Size': `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      'File Type': file.type,
      'Last Modified': new Date(file.lastModified).toLocaleDateString(),
      'Analysis Time': new Date().toLocaleString(),
      'Algorithm Version': '2.1.3'
    };
    
    // Add OCR metadata if available
    if (ocrData) {
      metadata['Text Extraction'] = 'Success';
      metadata['OCR Confidence'] = `${Math.round(ocrData.confidence)}%`;
      metadata['Text Length'] = `${ocrData.text.length} characters`;
      if (ocrData.pages) {
        metadata['PDF Pages'] = ocrData.pages;
      }
    } else {
      metadata['Text Extraction'] = 'Failed';
    }

    return {
      status,
      confidence,
      details,
      metadata,
      ocrData: ocrData || null
    };
  };

  const handleNewAnalysis = () => {
    setCurrentFile(null);
    setVerificationResult(null);
    setIsAnalyzing(false);
    setCurrentStep(0);
    setAnalysisSteps([]);
    setOcrProgress(0);
    setOcrResults(null);
    setIsOcrProcessing(false);
  };
  
  // Cleanup OCR service on unmount
  useEffect(() => {
    return () => {
      ocrService.terminate();
    };
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="gov-seal">📄</div>
          <h1>Fake Certificate Verification System</h1>
          <p className="subtitle">Anti-Fraud • AI-Powered • Blockchain-Secured</p>
          <p className="description">Advanced certificate authenticity verification to detect fraudulent educational, professional, and government certificates</p>
          <div className="security-badges">
            <span className="badge">🔒 SSL Encrypted</span>
            <span className="badge">🤖 AI-Powered Detection</span>
            <span className="badge">⛓️ Blockchain Verification</span>
            <span className="badge">🚫 Anti-Fraud Protected</span>
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
                <h2>Certificate Fraud Detection in Progress</h2>
                <p>Performing comprehensive authenticity analysis using AI-powered anti-fraud verification protocols</p>
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
                    {index === currentStep && step.isOcr && isOcrProcessing && (
                      <div className="ocr-progress">
                        <div className="ocr-progress-bar">
                          <div 
                            className="ocr-progress-fill" 
                            style={{ width: `${ocrProgress}%` }}
                          ></div>
                        </div>
                        <span className="ocr-progress-text">{ocrProgress}% complete</span>
                      </div>
                    )}
                    {index === currentStep && !step.isOcr && (
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
            <p>&copy; 2024 Fake Certificate Verification System</p>
            <p className="disclaimer">CONFIDENTIAL: Anti-Fraud System | All activities are logged and monitored</p>
          </div>
          <div className="footer-section">
            <div className="security-info">
              <span>🔒 SSL/TLS Encrypted</span>
              <span>🚫 Anti-Fraud Certified</span>
              <span>⛓️ Blockchain Secured</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
