from models import db
from datetime import datetime

class Interview(db.Model):
    __tablename__ = 'interviews'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    topic       = db.Column(db.String(100), nullable=False)
    total_questions = db.Column(db.Integer, default=0)
    score       = db.Column(db.Float, default=0.0)
    status      = db.Column(db.String(20), default='in_progress')  # in_progress | completed
    started_at  = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Questions in this session
    questions   = db.relationship('InterviewQuestion', backref='interview', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':              self.id,
            'topic':           self.topic,
            'total_questions': self.total_questions,
            'score':           self.score,
            'status':          self.status,
            'started_at':      self.started_at.isoformat(),
            'completed_at':    self.completed_at.isoformat() if self.completed_at else None
        }


class InterviewQuestion(db.Model):
    __tablename__ = 'interview_questions'

    id           = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('interviews.id'), nullable=False)
    question     = db.Column(db.Text, nullable=False)
    user_answer  = db.Column(db.Text, nullable=True)
    ai_feedback  = db.Column(db.Text, nullable=True)
    score        = db.Column(db.Float, nullable=True)   # 0–100
    is_bookmarked = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id':            self.id,
            'interview_id':  self.interview_id,
            'question':      self.question,
            'user_answer':   self.user_answer,
            'ai_feedback':   self.ai_feedback,
            'score':         self.score,
            'is_bookmarked': self.is_bookmarked
        }
