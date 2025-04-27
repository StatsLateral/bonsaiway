from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from pydantic import BaseModel, UUID4
from datetime import datetime
from services import SupabaseService, OpenAIService

# Initialize services
supabase_service = SupabaseService()
try:
    openai_service = OpenAIService()
    openai_available = True
except ValueError:
    openai_available = False

router = APIRouter(tags=["ai_care"])

# Pydantic models
class AiInsightBase(BaseModel):
    user_question: str

class AiInsightCreate(AiInsightBase):
    pass

class AiInsight(AiInsightBase):
    id: UUID4
    bonsai_id: UUID4
    ai_response: str
    created_at: datetime

    class Config:
        orm_mode = True

# Helper function to get authorization header
async def get_authorization(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return authorization

@router.get("/{bonsai_id}/insights", response_model=List[AiInsight])
async def get_bonsai_insights(bonsai_id: UUID4, authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    return await supabase_service.get_bonsai_insights(str(bonsai_id), user_id)

@router.post("/{bonsai_id}/insights", response_model=AiInsight)
async def create_bonsai_insight(bonsai_id: UUID4, insight: AiInsightCreate, authorization: str = Header(None)):
    if not openai_available:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key not configured"
        )
        
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    
    # Get bonsai data
    bonsai = await supabase_service.get_bonsai(str(bonsai_id), user_id)
    
    # Get image URLs
    image_urls = [img["image_url"] for img in bonsai.get("images", [])]
    
    # Generate AI response
    ai_response = await openai_service.generate_bonsai_insight(
        insight.user_question,
        bonsai,
        image_urls
    )
    
    # Save insight to database
    return await supabase_service.create_bonsai_insight(
        str(bonsai_id),
        user_id,
        insight.user_question,
        ai_response
    )

@router.delete("/{bonsai_id}/insights/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bonsai_insight(bonsai_id: UUID4, insight_id: UUID4, authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    await supabase_service.delete_bonsai_insight(str(bonsai_id), str(insight_id), user_id)
    return None
