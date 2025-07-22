from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models.models import ListType

class ListItemBase(BaseModel):
    name: str

class ListItemCreate(ListItemBase):
    pass

class ListItemUpdate(BaseModel):
    name: Optional[str] = None
    is_checked: Optional[bool] = None
    position: Optional[int] = None

class ListItem(ListItemBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_checked: bool
    position: int
    list_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class GroceryListBase(BaseModel):
    name: str
    list_type: ListType = ListType.INNE

class GroceryListCreate(GroceryListBase):
    pass

class GroceryListUpdate(BaseModel):
    name: Optional[str] = None
    list_type: Optional[ListType] = None

class GroceryList(GroceryListBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[ListItem] = []

class GroceryListSummary(GroceryListBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    item_count: int = 0

class ItemSuggestionBase(BaseModel):
    item_name: str
    list_type: ListType

class ItemSuggestion(ItemSuggestionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    usage_count: int
    last_used: datetime

class SortRequest(BaseModel):
    list_id: int

class ItemPositionUpdate(BaseModel):
    id: int
    position: int

class ReorderRequest(BaseModel):
    items: List[ItemPositionUpdate]