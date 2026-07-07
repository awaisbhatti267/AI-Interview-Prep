import json
from groq import Groq
from flask import current_app
from datetime import datetime
from models import db
from models.interview import Interview, InterviewQuestion
from models.resume import Resume


def generate_questions(user_id, topic, num_questions=10):
    """Generate interview questions using Groq based on topic and user skills."""
    client = Groq(api_key=current_app.config['GROQ_API_KEY'])

    # Get user skills from resume for context
    resume = Resume.query.filter_by(user_id=user_id).order_by(Resume.uploaded_at.desc()).first()
    skills_context = ''
    if resume and resume.skills:
        skills = json.loads(resume.skills)
        skills_context = ', '.join([s['name'] for s in skills])

    prompt = f"""
You are an expert technical interviewer. Generate {num_questions} interview questions for the topic: "{topic}".
{f'The candidate has these skills: {skills_context}.' if skills_context else ''}

Return ONLY a valid JSON array of question strings. No numbering, no explanation, just raw JSON.

Format:
["Question 1 here?", "Question 2 here?", ...]

Mix difficulty levels: 30% beginner, 50% intermediate, 20% advanced.
"""

    response = client.chat.completions.create(
        model=current_app.config['GROQ_MODEL'],
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.7,
        max_tokens=1500
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith('```'):
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]
    raw = raw.strip()

    questions = json.loads(raw)
    return questions


def start_interview(user_id, topic, num_questions=10):
    """Create interview session and generate questions."""
    questions_text = generate_questions(user_id, topic, num_questions)

    interview = Interview(
        user_id=user_id,
        topic=topic,
        total_questions=len(questions_text),
        status='in_progress'
    )
    db.session.add(interview)
    db.session.flush()  # get interview.id

    for q_text in questions_text:
        q = InterviewQuestion(interview_id=interview.id, question=q_text)
        db.session.add(q)

    db.session.commit()
    return interview


def evaluate_answer(question_text, user_answer, topic):
    """Use Groq to evaluate a user answer and return score + feedback."""
    client = Groq(api_key=current_app.config['GROQ_API_KEY'])

    prompt = f"""
You are an expert technical interviewer evaluating a candidate's answer.

Topic: {topic}
Question: {question_text}
Candidate's Answer: {user_answer}

Evaluate the answer and return ONLY a valid JSON object. No explanation, no markdown.

Format:
{{
  "score": 75,
  "feedback": "Your brief feedback here (2-3 sentences max).",
  "correct_answer": "The ideal answer in 2-3 sentences."
}}

Score must be an integer from 0 to 100.
"""

    response = client.chat.completions.create(
        model=current_app.config['GROQ_MODEL'],
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.3,
        max_tokens=500
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith('```'):
        raw = raw.split('```')[1]
        if raw.startswith('json'):
            raw = raw[4:]
    raw = raw.strip()

    result = json.loads(raw)
    return result


def submit_answer(question_id, user_answer):
    """Save user answer, evaluate with Groq, update score."""
    q = InterviewQuestion.query.get_or_404(question_id)
    evaluation = evaluate_answer(q.question, user_answer, q.interview.topic)

    q.user_answer = user_answer
    q.score       = evaluation.get('score', 0)
    q.ai_feedback = json.dumps({
        'feedback':       evaluation.get('feedback', ''),
        'correct_answer': evaluation.get('correct_answer', '')
    })
    db.session.commit()
    return q


def complete_interview(interview_id):
    """Mark interview complete and calculate final score."""
    interview = Interview.query.get_or_404(interview_id)
    answered  = [q for q in interview.questions if q.score is not None]

    if answered:
        interview.score = sum(q.score for q in answered) / len(answered)

    interview.status       = 'completed'
    interview.completed_at = datetime.utcnow()
    db.session.commit()
    return interview


def get_interview_history(user_id):
    """Get all completed interviews for a user."""
    interviews = (Interview.query
                  .filter_by(user_id=user_id, status='completed')
                  .order_by(Interview.completed_at.desc())
                  .all())
    return [i.to_dict() for i in interviews]


def get_performance_stats(user_id):
    """Calculate performance stats per topic."""
    interviews = Interview.query.filter_by(user_id=user_id, status='completed').all()

    topic_scores = {}
    for i in interviews:
        if i.topic not in topic_scores:
            topic_scores[i.topic] = []
        topic_scores[i.topic].append(i.score)

    stats = []
    for topic, scores in topic_scores.items():
        stats.append({
            'topic':     topic,
            'avg_score': round(sum(scores) / len(scores), 1),
            'attempts':  len(scores),
            'best':      round(max(scores), 1)
        })

    # Sort by avg_score ascending (weakest first)
    stats.sort(key=lambda x: x['avg_score'])
    return stats


def get_weak_topics(user_id, threshold=65):
    """Return topics where avg score is below threshold."""
    stats = get_performance_stats(user_id)
    return [s for s in stats if s['avg_score'] < threshold]
