import os
import json
import pdfplumber
from groq import Groq
from flask import current_app
from werkzeug.utils import secure_filename
from models import db
from models.resume import Resume

def extract_text_from_pdf(filepath):
    """Extract raw text from uploaded PDF."""
    text = ''
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
    return text.strip()


def extract_skills_with_groq(text):
    """Send resume text to Groq and get structured skills list."""
    client = Groq(api_key=current_app.config['GROQ_API_KEY'])

    prompt = f"""
You are an expert resume parser. Extract all technical and professional skills from the resume text below.

Return ONLY a valid JSON array of skill objects. No explanation, no markdown, just raw JSON.

Format:
[
  {{"name": "Python", "level": "Advanced"}},
  {{"name": "React.js", "level": "Intermediate"}},
  {{"name": "SQL", "level": "Advanced"}}
]

Levels must be one of: Beginner, Intermediate, Advanced.

Resume text:
{text[:4000]}
"""

    response = client.chat.completions.create(
        model=current_app.config['GROQ_MODEL'],
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.2,
        max_tokens=1000
    )

    raw = response.choices[0].message.content.strip()

    # Clean markdown fences if present
    if raw.startswith('```'):
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]
    raw = raw.strip()

    skills = json.loads(raw)
    return skills


def save_resume(user_id, file):
    """Save uploaded PDF and extract skills. Returns resume dict."""
    filename  = secure_filename(file.filename)
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    filepath  = os.path.join(upload_dir, f"{user_id}_{filename}")
    file.save(filepath)

    raw_text = extract_text_from_pdf(filepath)
    skills   = extract_skills_with_groq(raw_text)

    # Deactivate previous resumes (keep one active)
    Resume.query.filter_by(user_id=user_id).delete()

    resume = Resume(
        user_id=user_id,
        filename=filename,
        filepath=filepath,
        skills=json.dumps(skills),
        raw_text=raw_text
    )
    db.session.add(resume)
    db.session.commit()
    return resume.to_dict()


def get_resume(user_id):
    """Get latest resume for user."""
    resume = Resume.query.filter_by(user_id=user_id).order_by(Resume.uploaded_at.desc()).first()
    return resume.to_dict() if resume else None
