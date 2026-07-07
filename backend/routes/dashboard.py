from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.dashboard_service import get_dashboard_stats
from utils.response import success, error

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


@dashboard_bp.route('/', methods=['GET'])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    try:
        data = get_dashboard_stats(user_id)
        return success(data)
    except Exception as e:
        return error(f'Failed to load dashboard: {str(e)}')
