import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker - use local copy in public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  // Initialize Tesseract worker
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.worker = await Tesseract.createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            // You can emit progress events here if needed
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      
      // Optimize for certificate/document text
      await this.worker.setParameters({
        'tessedit_char_whitelist': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:!?"-()[]{}/',
        'tessedit_pageseg_mode': Tesseract.PSM.SPARSE_TEXT, // Better for certificates
        'preserve_interword_spaces': '1'
      });
      
      this.isInitialized = true;
      console.log('OCR Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR Service:', error);
      throw error;
    }
  }

  // Extract text from image file
  async extractTextFromImage(file, onProgress = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Create image URL for processing
      const imageUrl = URL.createObjectURL(file);
      
      // Process image with Tesseract
      const result = await this.worker.recognize(imageUrl, {
        logger: m => {
          if (onProgress && m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      // Clean up object URL
      URL.revokeObjectURL(imageUrl);
      
      // Process and clean the extracted text
      const cleanedText = this.cleanExtractedText(result.data.text);
      
      return {
        text: cleanedText,
        confidence: result.data.confidence,
        words: result.data.words?.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        })) || [],
        lines: result.data.lines?.map(line => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox
        })) || []
      };
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error('Failed to extract text from image: ' + error.message);
    }
  }

  // Convert PDF to images and extract text
  async extractTextFromPDF(file, onProgress = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const totalPages = pdf.numPages;
      let allText = '';
      let allWords = [];
      let allLines = [];
      let totalConfidence = 0;
      let pageCount = 0;

      // Process each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (onProgress) {
          onProgress(Math.round((pageNum - 1) / totalPages * 100));
        }

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

        // Create canvas to render PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convert canvas to blob
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png', 0.95);
        });

        // Extract text from rendered page image
        const pageResult = await this.extractTextFromImage(
          new File([blob], `page-${pageNum}.png`, { type: 'image/png' })
        );

        // Accumulate results
        allText += `\n--- Page ${pageNum} ---\n${pageResult.text}\n`;
        allWords.push(...pageResult.words.map(word => ({ ...word, page: pageNum })));
        allLines.push(...pageResult.lines.map(line => ({ ...line, page: pageNum })));
        totalConfidence += pageResult.confidence;
        pageCount++;
      }

      const averageConfidence = pageCount > 0 ? totalConfidence / pageCount : 0;
      const cleanedText = this.cleanExtractedText(allText);

      return {
        text: cleanedText,
        confidence: averageConfidence,
        words: allWords,
        lines: allLines,
        pages: totalPages
      };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF: ' + error.message);
    }
  }

  // Clean and process extracted text
  cleanExtractedText(rawText) {
    if (!rawText) return '';
    
    return rawText
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove common OCR artifacts  
      .replace(/[|\\/]/g, 'I')
      .replace(/0/g, 'O') // Only in specific contexts
      .replace(/\bI\b/g, '1') // Single I likely means 1
      // Clean up line breaks
      .replace(/\n\s*\n/g, '\n')
      // Trim whitespace
      .trim();
  }

  // Extract specific information patterns from certificate text
  extractCertificateInfo(text) {
    const info = {
      names: [],
      institutions: [],
      dates: [],
      degrees: [],
      certificates: [],
      emails: [],
      ids: []
    };

    if (!text) return info;

    // Name patterns (common certificate phrases)
    const namePatterns = [
      /(?:this is to certify that|hereby certify that|awarded to|presented to|granted to)\s+([A-Z][a-zA-Z\s.'-]+?)(?:\s+has|\s+is|\s+was|,|\n)/gi,
      /(?:name|student|recipient):\s*([A-Z][a-zA-Z\s.'-]+?)(?:\s+|,|\n)/gi
    ];

    namePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 2) {
          info.names.push(match[1].trim());
        }
      }
    });

    // Institution patterns
    const institutionPatterns = [
      /(?:university|college|institute|school|academy)\s+of\s+([a-zA-Z\s&.-]+?)(?:\s+|,|\n)/gi,
      /([a-zA-Z\s&.-]*(?:university|college|institute|school|academy))\s/gi
    ];

    institutionPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const inst = (match[1] || match[0]).trim();
        if (inst.length > 5) {
          info.institutions.push(inst);
        }
      }
    });

    // Date patterns
    const datePatterns = [
      /\b(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{4})\b/g,
      /\b(\d{4}[/.\-]\d{1,2}[/.\-]\d{1,2})\b/g,
      /\b((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/gi,
      /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})/gi
    ];

    datePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          info.dates.push(match[1].trim());
        }
      }
    });

    // Degree/qualification patterns
    const degreePatterns = [
      /\b(bachelor|master|doctor|phd|mba|bsc|msc|ba|ma|diploma|certificate)\s+(?:of\s+)?([a-zA-Z\s&.-]+?)(?:\s+|,|\n)/gi,
      /\b([a-zA-Z\s.-]+(?:degree|diploma|certificate|qualification))\b/gi
    ];

    degreePatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const degree = (match[0]).trim();
        if (degree.length > 3) {
          info.degrees.push(degree);
        }
      }
    });

    // Email patterns
    const emailPattern = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
    const emailMatches = text.matchAll(emailPattern);
    for (const match of emailMatches) {
      info.emails.push(match[1]);
    }

    // ID/Serial number patterns
    const idPatterns = [
      /(?:id|serial|number|ref|certificate\s+no?):\s*([A-Z0-9\-]+)/gi,
      /\b([A-Z0-9]{6,})\b/g // Generic alphanumeric IDs
    ];

    idPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length >= 6) {
          info.ids.push(match[1]);
        }
      }
    });

    // Remove duplicates
    Object.keys(info).forEach(key => {
      info[key] = [...new Set(info[key])];
    });

    return info;
  }

  // Main function to extract text from any supported file
  async extractText(file, onProgress = null) {
    try {
      let result;

      if (file.type.startsWith('image/')) {
        result = await this.extractTextFromImage(file, onProgress);
      } else if (file.type === 'application/pdf') {
        result = await this.extractTextFromPDF(file, onProgress);
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Extract structured information
      const certificateInfo = this.extractCertificateInfo(result.text);

      return {
        ...result,
        certificateInfo,
        fileType: file.type,
        fileName: file.name
      };
    } catch (error) {
      console.error('Error in OCR text extraction:', error);
      throw error;
    }
  }

  // Cleanup resources
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('OCR Service terminated');
    }
  }
}

// Create singleton instance
const ocrService = new OCRService();

export default ocrService;
