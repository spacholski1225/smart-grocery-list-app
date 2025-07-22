from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])
ai_service = AIService()


class ConvertTextRequest(BaseModel):
    text: str


class ConvertTextResponse(BaseModel):
    items: List[str]


@router.post("/convert-text", response_model=ConvertTextResponse)
async def convert_text_to_grocery_list(request: ConvertTextRequest):
    """
    Convert text to a grocery list using AI
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        items = ai_service.extract_grocery_items(request.text)
        
        if not items:
            raise HTTPException(
                status_code=422, 
                detail="Could not extract grocery items from the provided text"
            )
        
        return ConvertTextResponse(items=items)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")