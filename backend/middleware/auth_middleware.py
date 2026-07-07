from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User
from utils.response import error


def token_required(f):
    """Decorator to protect routes — verifies JWT and attaches current_user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user    = User.query.get(user_id)
            if not user:
                return error('User not found', 404)
        except Exception as e:
            return error('Invalid or expired token', 401)
        return f(*args, **kwargs)
    return decorated
