from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from app.db.session import Base

class ImageHistory(Base):
    __tablename__ = "image_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt = Column(String, nullable=False)
    image_url = Column(String)
    meta = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
