import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

from config import Config
from models import db
from services.auth_service import bcrypt

# ── Import all models so SQLAlchemy knows about them ──
from models.user import User
from models.resume import Resume
from models.interview import Interview, InterviewQuestion
from models.bookmark import Bookmark

# ── Import blueprints ──────────────────────────────
from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.interview import interview_bp
from routes.dashboard import dashboard_bp
from routes.bookmarks import bookmarks_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
        seconds=app.config['JWT_ACCESS_TOKEN_EXPIRES']
    )

    # ── Extensions ────────────────────────────────
    db.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)
    CORS(app)

    # ── Force CORS headers on every response ──────
    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin']  = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

    # ── Handle OPTIONS preflight globally ─────────
    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            res = jsonify({'ok': True})
            res.headers['Access-Control-Allow-Origin']  = '*'
            res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            return res, 200

    # ── Register blueprints ───────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(interview_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(bookmarks_bp)

    # ── Create DB tables ──────────────────────────
    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], host='0.0.0.0', port=5000)
