from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from app.db.session import Base

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String, nullable=False)
    results_json = Column(String)  # store as JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
