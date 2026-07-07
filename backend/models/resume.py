from models import db
from datetime import datetime

class Resume(db.Model):
    __tablename__ = 'resumes'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filename    = db.Column(db.String(255), nullable=False)
    filepath    = db.Column(db.String(500), nullable=False)
    skills      = db.Column(db.Text, nullable=True)        # JSON string of extracted skills
    raw_text    = db.Column(db.Text, nullable=True)        # extracted PDF text
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id':          self.id,
            'filename':    self.filename,
            'skills':      json.loads(self.skills) if self.skills else [],
            'uploaded_at': self.uploaded_at.isoformat()
        }
