"""
Document Processor for AI Detection
Extracts text from PDF, DOCX and other document formats
"""

import os
import io
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import base64

# PDF processing
try:
    import fitz  # PyMuPDF
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logging.warning("PyMuPDF not available. Install with: pip install PyMuPDF")

# Word document processing
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    logging.warning("python-docx not available. Install with: pip install python-docx")

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Extract text and metadata from various document formats"""
    
    # File size limits
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_PAGES = 100
    
    # Supported formats
    SUPPORTED_FORMATS = {'.pdf', '.docx', '.txt'}
    
    def __init__(self):
        """Initialize document processor"""
        self.supported_formats = self.SUPPORTED_FORMATS.copy()
        
        if not PDF_AVAILABLE:
            self.supported_formats.discard('.pdf')
            logger.warning("PDF support disabled - PyMuPDF not installed")
        
        if not DOCX_AVAILABLE:
            self.supported_formats.discard('.docx')
            logger.warning("DOCX support disabled - python-docx not installed")
        
        logger.info(f"Document processor initialized. Supported formats: {self.supported_formats}")
    
    def is_supported(self, filename: str) -> bool:
        """Check if file format is supported"""
        ext = Path(filename).suffix.lower()
        return ext in self.supported_formats
    
    def validate_file(self, file_data: bytes, filename: str) -> Tuple[bool, Optional[str]]:
        """
        Validate file before processing
        
        Returns:
            (is_valid, error_message)
        """
        # Check file size
        if len(file_data) > self.MAX_FILE_SIZE:
            return False, f"File too large. Maximum size: {self.MAX_FILE_SIZE / 1024 / 1024}MB"
        
        # Check file extension
        ext = Path(filename).suffix.lower()
        if ext not in self.supported_formats:
            return False, f"Unsupported format. Supported: {', '.join(self.supported_formats)}"
        
        # Check if file is empty
        if len(file_data) == 0:
            return False, "File is empty"
        
        return True, None
    
    def process_document(self, file_data: bytes, filename: str) -> Dict:
        """
        Process document and extract content
        
        Args:
            file_data: Raw file bytes
            filename: Original filename
            
        Returns:
            Dict with extracted content and metadata
        """
        # Validate file
        is_valid, error = self.validate_file(file_data, filename)
        if not is_valid:
            raise ValueError(error)
        
        ext = Path(filename).suffix.lower()
        
        # Route to appropriate processor
        if ext == '.pdf':
            return self._process_pdf(file_data, filename)
        elif ext == '.docx':
            return self._process_docx(file_data, filename)
        elif ext == '.txt':
            return self._process_txt(file_data, filename)
        else:
            raise ValueError(f"Unsupported format: {ext}")
    
    def _process_pdf(self, file_data: bytes, filename: str) -> Dict:
        """Extract text and metadata from PDF"""
        if not PDF_AVAILABLE:
            raise RuntimeError("PyMuPDF not installed")
        
        try:
            # Open PDF from bytes
            pdf_document = fitz.open(stream=file_data, filetype="pdf")
            
            # Extract metadata
            metadata = pdf_document.metadata
            page_count = pdf_document.page_count
            
            if page_count > self.MAX_PAGES:
                logger.warning(f"PDF has {page_count} pages, limiting to {self.MAX_PAGES}")
                page_count = self.MAX_PAGES
            
            # Extract text from each page
            pages_text = []
            total_text = []
            images = []
            
            for page_num in range(page_count):
                page = pdf_document[page_num]
                
                # Extract text
                page_text = page.get_text()
                pages_text.append({
                    "page": page_num + 1,
                    "text": page_text,
                    "char_count": len(page_text)
                })
                total_text.append(page_text)
                
                # Extract images (optional - for future image detection)
                image_list = page.get_images()
                if image_list:
                    images.append({
                        "page": page_num + 1,
                        "count": len(image_list)
                    })
            
            pdf_document.close()
            
            # Combine all text
            full_text = "\n\n".join(total_text)
            
            return {
                "filename": filename,
                "file_type": "pdf",
                "page_count": page_count,
                "total_characters": len(full_text),
                "total_words": len(full_text.split()),
                "full_text": full_text,
                "pages": pages_text,
                "images": images,
                "metadata": {
                    "title": metadata.get("title", ""),
                    "author": metadata.get("author", ""),
                    "subject": metadata.get("subject", ""),
                    "creator": metadata.get("creator", ""),
                    "producer": metadata.get("producer", ""),
                    "creation_date": metadata.get("creationDate", ""),
                    "mod_date": metadata.get("modDate", "")
                }
            }
            
        except Exception as e:
            logger.error(f"PDF processing error: {e}")
            raise RuntimeError(f"Failed to process PDF: {str(e)}")
    
    def _process_docx(self, file_data: bytes, filename: str) -> Dict:
        """Extract text and metadata from DOCX"""
        if not DOCX_AVAILABLE:
            raise RuntimeError("python-docx not installed")
        
        try:
            # Open DOCX from bytes
            doc = Document(io.BytesIO(file_data))
            
            # Extract text from paragraphs
            paragraphs = []
            full_text = []
            
            for para in doc.paragraphs:
                text = para.text.strip()
                if text:
                    paragraphs.append(text)
                    full_text.append(text)
            
            # Combine all text
            combined_text = "\n\n".join(full_text)
            
            # Extract core properties (metadata)
            core_props = doc.core_properties
            
            return {
                "filename": filename,
                "file_type": "docx",
                "page_count": 1,  # DOCX doesn't have clear page boundaries
                "paragraph_count": len(paragraphs),
                "total_characters": len(combined_text),
                "total_words": len(combined_text.split()),
                "full_text": combined_text,
                "paragraphs": paragraphs,
                "metadata": {
                    "title": core_props.title or "",
                    "author": core_props.author or "",
                    "subject": core_props.subject or "",
                    "keywords": core_props.keywords or "",
                    "created": str(core_props.created) if core_props.created else "",
                    "modified": str(core_props.modified) if core_props.modified else "",
                }
            }
            
        except Exception as e:
            logger.error(f"DOCX processing error: {e}")
            raise RuntimeError(f"Failed to process DOCX: {str(e)}")
    
    def _process_txt(self, file_data: bytes, filename: str) -> Dict:
        """Extract text from plain text file"""
        try:
            # Try UTF-8 first, fallback to latin-1
            try:
                text = file_data.decode('utf-8')
            except UnicodeDecodeError:
                text = file_data.decode('latin-1')
            
            return {
                "filename": filename,
                "file_type": "txt",
                "page_count": 1,
                "total_characters": len(text),
                "total_words": len(text.split()),
                "full_text": text,
                "metadata": {}
            }
            
        except Exception as e:
            logger.error(f"TXT processing error: {e}")
            raise RuntimeError(f"Failed to process TXT: {str(e)}")


# Example usage
if __name__ == "__main__":
    processor = DocumentProcessor()
    
    print(f"Supported formats: {processor.supported_formats}")
    print(f"PDF support: {PDF_AVAILABLE}")
    print(f"DOCX support: {DOCX_AVAILABLE}")
