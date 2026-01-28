import PyPDF2
import json

pdf_path = r'c:\Users\X1 Carbon\Desktop\abrilArte\repertorio violin.pdf'

try:
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        print(text)
except Exception as e:
    print(f"Error: {e}")
