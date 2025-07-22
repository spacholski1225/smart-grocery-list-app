from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models import schemas
from app.services.list_service import ListService

router = APIRouter()

@router.post("/", response_model=schemas.GroceryList, status_code=status.HTTP_201_CREATED)
def create_list(
    list_data: schemas.GroceryListCreate,
    db: Session = Depends(get_db)
):
    service = ListService(db)
    return service.create_list(list_data)

@router.get("/", response_model=List[schemas.GroceryListSummary])
def get_all_lists(db: Session = Depends(get_db)):
    service = ListService(db)
    return service.get_all_lists()

@router.get("/{list_id}", response_model=schemas.GroceryList)
def get_list(list_id: int, db: Session = Depends(get_db)):
    service = ListService(db)
    grocery_list = service.get_list(list_id)
    if not grocery_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    return grocery_list

@router.put("/{list_id}", response_model=schemas.GroceryList)
def update_list(
    list_id: int,
    list_data: schemas.GroceryListUpdate,
    db: Session = Depends(get_db)
):
    service = ListService(db)
    updated_list = service.update_list(list_id, list_data)
    if not updated_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    return updated_list

@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(list_id: int, db: Session = Depends(get_db)):
    service = ListService(db)
    success = service.delete_list(list_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

@router.post("/{list_id}/sort", response_model=schemas.GroceryList)
def sort_list(
    list_id: int,
    db: Session = Depends(get_db)
):
    print(f"[SORT ENDPOINT] Starting sort for list_id: {list_id}")
    service = ListService(db)
    
    # Pobierz listę przed sortowaniem
    original_list = service.get_list(list_id)
    if original_list:
        print(f"[SORT ENDPOINT] Original list found: {original_list.name}")
        print(f"[SORT ENDPOINT] List type: {original_list.list_type}")
        print(f"[SORT ENDPOINT] Items count: {len(original_list.items)}")
        if original_list.items:
            items_names = [item.name for item in original_list.items]
            print(f"[SORT ENDPOINT] Items: {items_names}")
    else:
        print(f"[SORT ENDPOINT] List not found!")
    
    sorted_list = service.sort_list(list_id)
    if not sorted_list:
        print(f"[SORT ENDPOINT] Sort failed - list not found or not a grocery list")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found or not a grocery list"
        )
    
    print(f"[SORT ENDPOINT] Sort completed successfully")
    if sorted_list.items:
        sorted_items_names = [item.name for item in sorted_list.items]
        print(f"[SORT ENDPOINT] Sorted items: {sorted_items_names}")
    
    return sorted_list

@router.put("/{list_id}/reorder", response_model=schemas.GroceryList)
def reorder_list_items(
    list_id: int,
    reorder_data: schemas.ReorderRequest,
    db: Session = Depends(get_db)
):
    service = ListService(db)
    updated_list = service.reorder_list_items(list_id, reorder_data.items)
    if not updated_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    return updated_list

@router.delete("/{list_id}/clear-completed", response_model=schemas.GroceryList)
def clear_completed_items(
    list_id: int,
    db: Session = Depends(get_db)
):
    service = ListService(db)
    updated_list = service.clear_completed_items(list_id)
    if not updated_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    return updated_list