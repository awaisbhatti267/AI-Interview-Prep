from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.interview_service import (
    start_interview, submit_answer, complete_interview,
    get_interview_history, get_performance_stats, get_weak_topics
)
from models.interview import Interview, InterviewQuestion
from utils.response import success, error

interview_bp = Blueprint('interview', __name__, url_prefix='/api/interview')


@interview_bp.route('/start', methods=['POST'])
@jwt_required()
def start():
    user_id = get_jwt_identity()
    data    = request.get_json()
    topic   = data.get('topic', '').strip()
    num_q   = int(data.get('num_questions', 10))

    if not topic:
        return error('Topic is required')
    if num_q < 1 or num_q > 20:
        return error('num_questions must be between 1 and 20')

    try:
        interview = start_interview(user_id, topic, num_q)
        questions = [q.to_dict() for q in interview.questions]
        return success({
            'interview': interview.to_dict(),
            'questions': questions
        }, 'Interview started', 201)
    except Exception as e:
        return error(f'Failed to start interview: {str(e)}')


@interview_bp.route('/answer', methods=['POST'])
@jwt_required()
def answer():
    data        = request.get_json()
    question_id = data.get('question_id')
    user_answer = data.get('answer', '').strip()

    if not question_id or not user_answer:
        return error('question_id and answer are required')

    try:
        q = submit_answer(question_id, user_answer)
        feedback = {}
        if q.ai_feedback:
            import json
            feedback = json.loads(q.ai_feedback)
        return success({
            'question_id':    q.id,
            'score':          q.score,
            'feedback':       feedback.get('feedback', ''),
            'correct_answer': feedback.get('correct_answer', '')
        })
    except Exception as e:
        return error(f'Failed to evaluate answer: {str(e)}')


@interview_bp.route('/<int:interview_id>/complete', methods=['POST'])
@jwt_required()
def complete(interview_id):
    try:
        interview = complete_interview(interview_id)
        return success({'interview': interview.to_dict()}, 'Interview completed')
    except Exception as e:
        return error(f'Failed to complete interview: {str(e)}')


@interview_bp.route('/<int:interview_id>', methods=['GET'])
@jwt_required()
def get_interview(interview_id):
    interview = Interview.query.get_or_404(interview_id)
    questions = [q.to_dict() for q in interview.questions]
    return success({'interview': interview.to_dict(), 'questions': questions})


@interview_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    user_id    = get_jwt_identity()
    interviews = get_interview_history(user_id)
    return success({'interviews': interviews})


@interview_bp.route('/performance', methods=['GET'])
@jwt_required()
def performance():
    user_id = get_jwt_identity()
    stats   = get_performance_stats(user_id)
    return success({'stats': stats})


@interview_bp.route('/weak-topics', methods=['GET'])
@jwt_required()
def weak_topics():
    user_id   = get_jwt_identity()
    threshold = int(request.args.get('threshold', 65))
    topics    = get_weak_topics(user_id, threshold)
    return success({'weak_topics': topics})
