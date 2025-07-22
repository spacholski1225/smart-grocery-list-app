from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.models import GroceryList, ListItem, ListType
from app.models import schemas
from app.services.ai_service import AIService

class ListService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = AIService()

    def create_list(self, list_data: schemas.GroceryListCreate) -> GroceryList:
        db_list = GroceryList(
            name=list_data.name,
            list_type=list_data.list_type
        )
        self.db.add(db_list)
        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def get_all_lists(self) -> List[schemas.GroceryListSummary]:
        lists = self.db.query(GroceryList).all()
        result = []
        for grocery_list in lists:
            item_count = self.db.query(ListItem).filter(ListItem.list_id == grocery_list.id).count()
            list_summary = schemas.GroceryListSummary(
                id=grocery_list.id,
                name=grocery_list.name,
                list_type=grocery_list.list_type,
                created_at=grocery_list.created_at,
                updated_at=grocery_list.updated_at,
                item_count=item_count
            )
            result.append(list_summary)
        return result

    def get_list(self, list_id: int) -> Optional[GroceryList]:
        return self.db.query(GroceryList).filter(GroceryList.id == list_id).first()

    def update_list(self, list_id: int, list_data: schemas.GroceryListUpdate) -> Optional[GroceryList]:
        db_list = self.db.query(GroceryList).filter(GroceryList.id == list_id).first()
        if not db_list:
            return None
        
        if list_data.name is not None:
            db_list.name = list_data.name
        if list_data.list_type is not None:
            db_list.list_type = list_data.list_type
        
        self.db.commit()
        self.db.refresh(db_list)
        return db_list

    def delete_list(self, list_id: int) -> bool:
        db_list = self.db.query(GroceryList).filter(GroceryList.id == list_id).first()
        if not db_list:
            return False
        
        self.db.delete(db_list)
        self.db.commit()
        return True

    def sort_list(self, list_id: int) -> Optional[GroceryList]:
        db_list = self.db.query(GroceryList).filter(GroceryList.id == list_id).first()
        if not db_list or db_list.list_type != ListType.ZAKUPY:
            return None
        
        items = self.db.query(ListItem).filter(ListItem.list_id == list_id).all()
        item_names = [item.name for item in items]
        
        try:
            sorted_names = self.ai_service.sort_grocery_items(item_names)
            
            for i, sorted_name in enumerate(sorted_names):
                for item in items:
                    if item.name == sorted_name:
                        item.position = i
                        break
            
            self.db.commit()
            self.db.refresh(db_list)
            return db_list
        except Exception:
            return db_list

    def reorder_list_items(self, list_id: int, item_updates: List[schemas.ItemPositionUpdate]) -> Optional[GroceryList]:
        """
        Reorder items in a list based on provided position updates
        """
        # Check if list exists
        db_list = self.db.query(GroceryList).filter(GroceryList.id == list_id).first()
        if not db_list:
            return None
        
        # Get all items for this list
        items = self.db.query(ListItem).filter(ListItem.list_id == list_id).all()
        item_dict = {item.id: item for item in items}
        
        # Update positions for items that are in the update request
        for update in item_updates:
            if update.id in item_dict:
                item_dict[update.id].position = update.position
        
        try:
            self.db.commit()
            self.db.refresh(db_list)
            return db_list
        except Exception as e:
            self.db.rollback()
            print(f"Error reordering items: {e}")
            return None

    def clear_completed_items(self, list_id: int) -> Optional[GroceryList]:
        """
        Remove all completed (checked) items from a list
        """
        # Check if list exists
        db_list = self.db.query(GroceryList).filter(GroceryList.id == list_id).first()
        if not db_list:
            return None
        
        # Delete all completed items for this list
        try:
            deleted_count = self.db.query(ListItem).filter(
                ListItem.list_id == list_id,
                ListItem.is_checked == True
            ).delete()
            
            print(f"Deleted {deleted_count} completed items from list {list_id}")
            
            self.db.commit()
            self.db.refresh(db_list)
            return db_list
        except Exception as e:
            self.db.rollback()
            print(f"Error clearing completed items: {e}")
            return None