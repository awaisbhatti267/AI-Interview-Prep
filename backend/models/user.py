from models import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id              = db.Column(db.Integer, primary_key=True)
    name            = db.Column(db.String(100), nullable=False)
    email           = db.Column(db.String(150), unique=True, nullable=False)
    password        = db.Column(db.String(255), nullable=False)
    is_verified     = db.Column(db.Boolean, default=False)
    otp_code        = db.Column(db.String(6), nullable=True)
    otp_expires_at  = db.Column(db.DateTime, nullable=True)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    resumes    = db.relationship('Resume',    backref='user', lazy=True, cascade='all, delete-orphan')
    interviews = db.relationship('Interview', backref='user', lazy=True, cascade='all, delete-orphan')
    bookmarks  = db.relationship('Bookmark',  backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':          self.id,
            'name':        self.name,
            'email':       self.email,
            'is_verified': self.is_verified,
            'created_at':  self.created_at.isoformat()
        }
