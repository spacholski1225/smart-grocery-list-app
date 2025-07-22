from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.models.models import ListItem, GroceryList, ItemSuggestion
from app.models import schemas
from app.services.suggestion_service import SuggestionService

class ItemService:
    def __init__(self, db: Session):
        self.db = db
        self.suggestion_service = SuggestionService(db)

    def create_item(self, item_data: schemas.ListItemCreate, list_id: int) -> ListItem:
        grocery_list = self.db.query(GroceryList).filter(GroceryList.id == list_id).first()
        if not grocery_list:
            raise ValueError("List not found")
        
        max_position = self.db.query(func.max(ListItem.position)).filter(ListItem.list_id == list_id).scalar() or 0
        
        db_item = ListItem(
            name=item_data.name,
            list_id=list_id,
            position=max_position + 1
        )
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        
        self.suggestion_service.update_suggestion(item_data.name, grocery_list.list_type)
        
        return db_item

    def get_item(self, item_id: int) -> Optional[ListItem]:
        return self.db.query(ListItem).filter(ListItem.id == item_id).first()

    def update_item(self, item_id: int, item_data: schemas.ListItemUpdate) -> Optional[ListItem]:
        db_item = self.db.query(ListItem).filter(ListItem.id == item_id).first()
        if not db_item:
            return None
        
        if item_data.name is not None:
            db_item.name = item_data.name
        if item_data.is_checked is not None:
            db_item.is_checked = item_data.is_checked
        if item_data.position is not None:
            db_item.position = item_data.position
        
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def delete_item(self, item_id: int) -> bool:
        db_item = self.db.query(ListItem).filter(ListItem.id == item_id).first()
        if not db_item:
            return False
        
        self.db.delete(db_item)
        self.db.commit()
        return True

    def toggle_check(self, item_id: int) -> Optional[ListItem]:
        db_item = self.db.query(ListItem).filter(ListItem.id == item_id).first()
        if not db_item:
            return None
        
        db_item.is_checked = not db_item.is_checked
        self.db.commit()
        self.db.refresh(db_item)
        return db_item