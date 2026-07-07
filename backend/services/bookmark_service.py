from models import db
from models.bookmark import Bookmark
from models.interview import InterviewQuestion


def toggle_bookmark(user_id, question_id):
    """Add bookmark if not exists, remove if exists. Returns action taken."""
    existing = Bookmark.query.filter_by(user_id=user_id, question_id=question_id).first()

    if existing:
        db.session.delete(existing)
        # Update question flag
        q = InterviewQuestion.query.get(question_id)
        if q:
            q.is_bookmarked = False
        db.session.commit()
        return 'removed'
    else:
        bookmark = Bookmark(user_id=user_id, question_id=question_id)
        db.session.add(bookmark)
        q = InterviewQuestion.query.get(question_id)
        if q:
            q.is_bookmarked = True
        db.session.commit()
        return 'added'


def get_bookmarks(user_id):
    """Get all bookmarked questions for a user."""
    bookmarks = (Bookmark.query
                 .filter_by(user_id=user_id)
                 .order_by(Bookmark.created_at.desc())
                 .all())
    return [b.to_dict() for b in bookmarks]
