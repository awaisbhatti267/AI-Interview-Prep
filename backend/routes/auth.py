from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from email_validator import validate_email, EmailNotValidError
from services.auth_service import register_user, login_user
from services.email_service import create_and_send_otp, verify_otp
from models.user import User
from utils.response import success, error

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def check_email(email):
    """Returns (normalized_email, error_message)"""
    blocked_domains = {
        'sample.com', 'example.com', 'test.com', 'fake.com',
        'mailinator.com', 'guerrillamail.com', 'tempmail.com',
        'throwaway.email', 'yopmail.com', 'sharklasers.com'
    }
    domain = email.split('@')[-1].lower() if '@' in email else ''
    if domain in blocked_domains:
        return None, f'"{domain}" is not accepted. Please use a real email address.'
    try:
        valid = validate_email(email, check_deliverability=True)
        return valid.normalized, None
    except EmailNotValidError as e:
        return None, str(e)


@auth_bp.route('/register', methods=['POST'])
def register():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return error('Name, email and password are required')
    if len(password) < 6:
        return error('Password must be at least 6 characters')

    clean_email, err = check_email(email)
    if err:
        return error(f'Invalid email: {err}')

    user, err = register_user(name, clean_email, password)
    if err:
        return error(err)

    # Send OTP
    try:
        create_and_send_otp(user)
    except Exception as e:
        return error(f'Account created but failed to send verification email: {str(e)}')

    return success(
        {'email': clean_email},
        'Account created. Please check your email for the verification code.',
        201
    )


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp_route():
    data      = request.get_json()
    email     = data.get('email', '').strip().lower()
    otp_input = data.get('otp', '').strip()

    if not email or not otp_input:
        return error('Email and OTP code are required')

    verified, msg = verify_otp(email, otp_input)
    if not verified:
        return error(msg)

    # Auto-login after verification
    user = User.query.filter_by(email=email).first()
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity=str(user.id))

    return success({'token': token, 'user': user.to_dict()}, msg)


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    data  = request.get_json()
    email = data.get('email', '').strip().lower()

    if not email:
        return error('Email is required')

    user = User.query.filter_by(email=email).first()
    if not user:
        return error('No account found with this email')
    if user.is_verified:
        return error('Email is already verified')

    try:
        create_and_send_otp(user)
        return success(None, 'New verification code sent to your email')
    except Exception as e:
        return error(f'Failed to send email: {str(e)}')


@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return error('Email and password are required')

    try:
        valid = validate_email(email, check_deliverability=False)
        email = valid.normalized
    except EmailNotValidError:
        return error('Invalid email address')

    token, user, err = login_user(email, password)
    if err:
        # If not verified, tell frontend to redirect to OTP page
        if 'verify' in err.lower():
            return error(err, 403)
        return error(err, 401)

    return success({'token': token, 'user': user.to_dict()}, 'Login successful')


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    if not user:
        return error('User not found', 404)
    return success({'user': user.to_dict()})
