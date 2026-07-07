from models import db
from datetime import datetime

class Bookmark(db.Model):
    __tablename__ = 'bookmarks'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('interview_questions.id'), nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    question    = db.relationship('InterviewQuestion', backref='bookmarks', lazy=True)

    def to_dict(self):
        return {
            'id':         self.id,
            'question':   self.question.to_dict() if self.question else None,
            'created_at': self.created_at.isoformat()
        }
