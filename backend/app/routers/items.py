from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models import schemas
from app.services.item_service import ItemService
from app.services.suggestion_service import SuggestionService

router = APIRouter()

@router.post("/", response_model=schemas.ListItem, status_code=status.HTTP_201_CREATED)
def create_item(
    item_data: schemas.ListItemCreate,
    list_id: int,
    db: Session = Depends(get_db)
):
    service = ItemService(db)
    return service.create_item(item_data, list_id)

@router.get("/{item_id}", response_model=schemas.ListItem)
def get_item(item_id: int, db: Session = Depends(get_db)):
    service = ItemService(db)
    item = service.get_item(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item

@router.put("/{item_id}", response_model=schemas.ListItem)
def update_item(
    item_id: int,
    item_data: schemas.ListItemUpdate,
    db: Session = Depends(get_db)
):
    service = ItemService(db)
    updated_item = service.update_item(item_id, item_data)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return updated_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    service = ItemService(db)
    success = service.delete_item(item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

@router.patch("/{item_id}/check", response_model=schemas.ListItem)
def toggle_item_check(item_id: int, db: Session = Depends(get_db)):
    service = ItemService(db)
    item = service.toggle_check(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item

@router.get("/suggestions/{list_type}", response_model=List[schemas.ItemSuggestion])
def get_suggestions(
    list_type: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    service = SuggestionService(db)
    return service.get_suggestions(list_type, limit)