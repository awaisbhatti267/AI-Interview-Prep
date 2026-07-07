import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app
from datetime import datetime, timedelta
from models import db
from models.user import User


def generate_otp():
    """Generate a 6-digit numeric OTP."""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(to_email, name, otp):
    """Send OTP verification email via SMTP."""
    subject = 'Verify your AI Interview account'

    html = f"""
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7c3aed; margin: 0; font-size: 24px;">AI Interview</h1>
            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Prep Platform</p>
        </div>

        <h2 style="color: #111827; font-size: 20px;">Hi {name}, verify your email</h2>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
            Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.
        </p>

        <div style="background: #f5f3ff; border: 2px dashed #c4b5fd; border-radius: 12px;
                    text-align: center; padding: 28px; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Your verification code</p>
            <h1 style="color: #7c3aed; font-size: 42px; font-weight: 800;
                       letter-spacing: 10px; margin: 0;">{otp}</h1>
        </div>

        <p style="color: #9ca3af; font-size: 13px;">
            If you didn't create an account, you can safely ignore this email.
        </p>
    </div>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = current_app.config['MAIL_FROM']
    msg['To']      = to_email
    msg.attach(MIMEText(html, 'html'))

    with smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT']) as server:
        server.starttls()
        server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
        server.sendmail(current_app.config['MAIL_FROM'], to_email, msg.as_string())


def create_and_send_otp(user):
    """Generate OTP, save to user, send email."""
    otp = generate_otp()
    user.otp_code       = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    send_otp_email(user.email, user.name, otp)
    return otp


def verify_otp(email, otp_input):
    """Verify the OTP for a given email. Returns (success, message)."""
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, 'User not found'

    if user.is_verified:
        return True, 'Already verified'

    if not user.otp_code:
        return False, 'No OTP was generated. Please register again.'

    if datetime.utcnow() > user.otp_expires_at:
        return False, 'OTP has expired. Please request a new one.'

    if user.otp_code != otp_input.strip():
        return False, 'Incorrect code. Please try again.'

    # Mark verified and clear OTP
    user.is_verified   = True
    user.otp_code      = None
    user.otp_expires_at = None
    db.session.commit()
    return True, 'Email verified successfully'
