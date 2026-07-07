from models.interview import Interview
from models.resume import Resume
from datetime import datetime, timedelta
import json


def get_dashboard_stats(user_id):
    """Aggregate all stats for the dashboard."""

    completed = Interview.query.filter_by(user_id=user_id, status='completed').all()

    # ── Overall score (avg of all completed)
    overall_score = 0
    if completed:
        overall_score = round(sum(i.score for i in completed) / len(completed), 1)

    # ── Interviews this month
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month = [i for i in completed if i.completed_at and i.completed_at >= month_start]

    # ── Last month comparison
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month = [i for i in completed
                  if i.completed_at and last_month_start <= i.completed_at < month_start]
    last_month_avg = round(sum(i.score for i in last_month) / len(last_month), 1) if last_month else 0

    score_trend = round(overall_score - last_month_avg, 1) if last_month_avg else 0

    # ── Skills progress from latest resume
    skills = []
    resume = Resume.query.filter_by(user_id=user_id).order_by(Resume.uploaded_at.desc()).first()
    if resume and resume.skills:
        raw_skills = json.loads(resume.skills)
        level_map  = {'Beginner': 40, 'Intermediate': 70, 'Advanced': 90}
        for s in raw_skills[:6]:
            # Try to find actual score from interview history
            topic_interviews = [i for i in completed if i.topic.lower() in s['name'].lower()]
            if topic_interviews:
                score = round(sum(i.score for i in topic_interviews) / len(topic_interviews), 1)
            else:
                score = level_map.get(s.get('level', 'Intermediate'), 70)
            skills.append({'name': s['name'], 'score': score})

    # ── Recent interviews (last 5)
    recent = sorted(completed, key=lambda x: x.completed_at or datetime.min, reverse=True)[:5]

    # ── Resume status
    resume_status = resume.to_dict() if resume else None

    return {
        'overall_score':    overall_score,
        'score_trend':      score_trend,
        'interviews_taken': len(completed),
        'interviews_this_month': len(this_month),
        'average_score':    overall_score,
        'skills':           skills,
        'recent_interviews': [i.to_dict() for i in recent],
        'resume':           resume_status
    }
