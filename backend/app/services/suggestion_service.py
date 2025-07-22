from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from app.models.models import ItemSuggestion, ListType
from app.models import schemas
from datetime import datetime

class SuggestionService:
    def __init__(self, db: Session):
        self.db = db

    def update_suggestion(self, item_name: str, list_type: ListType):
        existing_suggestion = self.db.query(ItemSuggestion).filter(
            ItemSuggestion.item_name.ilike(item_name),
            ItemSuggestion.list_type == list_type
        ).first()
        
        if existing_suggestion:
            existing_suggestion.usage_count += 1
            existing_suggestion.last_used = datetime.utcnow()
        else:
            new_suggestion = ItemSuggestion(
                item_name=item_name,
                list_type=list_type,
                usage_count=1,
                last_used=datetime.utcnow()
            )
            self.db.add(new_suggestion)
        
        self.db.commit()

    def get_suggestions(self, list_type: str, limit: int = 10) -> List[schemas.ItemSuggestion]:
        try:
            list_type_enum = ListType(list_type.lower())
        except ValueError:
            return []
        
        suggestions = self.db.query(ItemSuggestion).filter(
            ItemSuggestion.list_type == list_type_enum
        ).order_by(
            desc(ItemSuggestion.usage_count),
            desc(ItemSuggestion.last_used)
        ).limit(limit).all()
        
        return suggestions

    def search_suggestions(self, query: str, list_type: str, limit: int = 5) -> List[schemas.ItemSuggestion]:
        try:
            list_type_enum = ListType(list_type.lower())
        except ValueError:
            return []
        
        suggestions = self.db.query(ItemSuggestion).filter(
            ItemSuggestion.list_type == list_type_enum,
            ItemSuggestion.item_name.ilike(f'%{query}%')
        ).order_by(
            desc(ItemSuggestion.usage_count),
            desc(ItemSuggestion.last_used)
        ).limit(limit).all()
        
        return suggestions