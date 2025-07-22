from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from datetime import datetime

Base = declarative_base()

class ListType(str, Enum):
    ZAKUPY = "zakupy"
    INNE = "inne"

class GroceryList(Base):
    __tablename__ = "grocery_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    list_type = Column(SQLEnum(ListType), nullable=False, default=ListType.INNE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship("ListItem", back_populates="grocery_list", cascade="all, delete-orphan")

class ListItem(Base):
    __tablename__ = "list_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    is_checked = Column(Boolean, default=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    list_id = Column(Integer, ForeignKey("grocery_lists.id"), nullable=False)
    grocery_list = relationship("GroceryList", back_populates="items")

class ItemSuggestion(Base):
    __tablename__ = "item_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(255), nullable=False)
    list_type = Column(SQLEnum(ListType), nullable=False)
    usage_count = Column(Integer, default=1)
    last_used = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = {'sqlite_autoincrement': True}