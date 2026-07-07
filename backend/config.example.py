import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = 'your-secret-key-here'
    DEBUG = True

    # MySQL
    MYSQL_USER     = 'root'
    MYSQL_PASSWORD = 'your-mysql-password'
    MYSQL_HOST     = 'localhost'
    MYSQL_PORT     = '3306'
    MYSQL_DB       = 'ai_interview'

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY           = 'your-jwt-secret-here'
    JWT_ACCESS_TOKEN_EXPIRES = 86400

    GROQ_API_KEY = 'your-groq-api-key'
    GROQ_MODEL   = 'llama-3.3-70b-versatile'

    UPLOAD_FOLDER      = 'uploads'
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf'}

    FRONTEND_URL = 'http://localhost:5173'

    MAIL_SERVER   = 'smtp.gmail.com'
    MAIL_PORT     = 587
    MAIL_USERNAME = 'your-email@gmail.com'
    MAIL_PASSWORD = 'your-gmail-app-password'
    MAIL_FROM     = 'your-email@gmail.com'
