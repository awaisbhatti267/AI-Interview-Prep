from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from models.user import User
from models import db

bcrypt = Bcrypt()

def register_user(name, email, password):
    """Create a new unverified user. Returns (user, error)."""
    if User.query.filter_by(email=email).first():
        return None, 'Email already registered'

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(name=name, email=email, password=hashed, is_verified=False)
    db.session.add(user)
    db.session.commit()
    return user, None


def login_user(email, password):
    """Verify credentials and return JWT token. Returns (token, user, error)."""
    user = User.query.filter_by(email=email).first()
    if not user:
        return None, None, 'Invalid email or password'

    if not bcrypt.check_password_hash(user.password, password):
        return None, None, 'Invalid email or password'

    if not user.is_verified:
        return None, None, 'Please verify your email before logging in'

    token = create_access_token(identity=str(user.id))
    return token, user, None
