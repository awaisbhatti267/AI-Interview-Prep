from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.resume_service import save_resume, get_resume
from utils.response import success, error
from utils.allowed_file import allowed_file

resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')


@resume_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload():
    user_id = get_jwt_identity()

    if 'file' not in request.files:
        return error('No file provided')

    file = request.files['file']
    if file.filename == '':
        return error('No file selected')

    if not allowed_file(file.filename):
        return error('Only PDF files are allowed')

    try:
        resume = save_resume(user_id, file)
        return success(resume, 'Resume uploaded and skills extracted successfully', 201)
    except Exception as e:
        return error(f'Failed to process resume: {str(e)}')


@resume_bp.route('/', methods=['GET'])
@jwt_required()
def get():
    user_id = get_jwt_identity()
    resume  = get_resume(user_id)
    if not resume:
        return success(None, 'No resume uploaded yet')
    return success(resume)
