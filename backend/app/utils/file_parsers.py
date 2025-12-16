"""
File parsing utilities.

Supports:
- CSV
- Excel
- JSON
- PDF (placeholder)
- Word (placeholder)
"""

import pandas as pd
import json
from docx import Document
from pypdf import PdfReader


def parse_csv(file):
    """Parse CSV into DataFrame"""
    return pd.read_csv(file)


def parse_excel(file):
    """Parse Excel into DataFrame"""
    return pd.read_excel(file)


def parse_json(file):
    """Parse JSON file"""
    return json.load(file)


def parse_pdf(file):
    """
    Placeholder PDF parser.

    TODO:
    - Chunk text
    - OCR
    - Vector ingestion
    """
    reader = PdfReader(file)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def parse_word(file):
    """
    Placeholder Word parser.

    TODO:
    - Table extraction
    - Vector ingestion
    """
    doc = Document(file)
    return "\n".join(p.text for p in doc.paragraphs)
