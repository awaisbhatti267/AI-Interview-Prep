from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.bookmark_service import toggle_bookmark, get_bookmarks
from utils.response import success, error

bookmarks_bp = Blueprint('bookmarks', __name__, url_prefix='/api/bookmarks')


@bookmarks_bp.route('/', methods=['GET'])
@jwt_required()
def list_bookmarks():
    user_id   = get_jwt_identity()
    bookmarks = get_bookmarks(user_id)
    return success({'bookmarks': bookmarks})


@bookmarks_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle():
    user_id     = get_jwt_identity()
    data        = request.get_json()
    question_id = data.get('question_id')

    if not question_id:
        return error('question_id is required')

    action = toggle_bookmark(user_id, question_id)
    return success({'action': action}, f'Bookmark {action}')
