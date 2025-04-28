from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Header
from typing import List, Optional
from pydantic import BaseModel, UUID4
from datetime import datetime
from services import SupabaseService

# Initialize services
supabase_service = SupabaseService()

router = APIRouter(tags=["bonsais"])

# Pydantic models
class BonsaiBase(BaseModel):
    title: str
    description: Optional[str] = None

class BonsaiCreate(BonsaiBase):
    pass

class BonsaiImage(BaseModel):
    id: UUID4
    bonsai_id: UUID4
    image_url: str
    created_at: datetime

class Bonsai(BonsaiBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime
    images: List[BonsaiImage] = []

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

@router.get("/", response_model=List[Bonsai])
async def get_bonsais(authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    return await supabase_service.get_bonsais(user_id)

@router.post("/", response_model=Bonsai)
async def create_bonsai(bonsai: BonsaiCreate, authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    # Ensure user_id is a valid UUID string
    import uuid
    try:
        user_id = str(uuid.UUID(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id: not a valid UUID."
        )
    
    bonsai_data = {
        "title": bonsai.title,
        "description": bonsai.description
    }
    
    return await supabase_service.create_bonsai(user_id, bonsai_data)

@router.get("/{bonsai_id}", response_model=Bonsai)
async def get_bonsai(bonsai_id: UUID4, authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    return await supabase_service.get_bonsai(str(bonsai_id), user_id)

@router.put("/{bonsai_id}", response_model=Bonsai)
async def update_bonsai(bonsai_id: UUID4, bonsai: BonsaiBase, authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    
    bonsai_data = {
        "title": bonsai.title,
        "description": bonsai.description
    }
    
    return await supabase_service.update_bonsai(str(bonsai_id), user_id, bonsai_data)

@router.delete("/{bonsai_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bonsai(bonsai_id: UUID4, authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    await supabase_service.delete_bonsai(str(bonsai_id), user_id)
    return None

@router.post("/{bonsai_id}/images", response_model=BonsaiImage)
async def upload_bonsai_image(
    bonsai_id: UUID4,
    file: UploadFile = File(...),
    authorization: str = Header(None)
):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    
    # Read file content
    file_content = await file.read()
    
    return await supabase_service.upload_bonsai_image(
        str(bonsai_id),
        user_id,
        file_content,
        file.filename
    )

@router.post("/with-image", response_model=Bonsai)
async def create_bonsai_with_image(
    file: UploadFile = File(...),
    title: str = Form("New Bonsai"),  # Default title if not provided
    description: Optional[str] = Form(None),
    authorization: str = Header(None)
):
    print('HIT /api/bonsais/with-image endpoint')
    try:
        auth = await get_authorization(authorization)
        user_id = await supabase_service.get_user_id(auth)
        # Ensure user_id is a valid UUID string
        import uuid
        try:
            user_id = str(uuid.UUID(user_id))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user_id: not a valid UUID."
            )
        
        # Read file content first
        file_content = await file.read()
        
        # Create the bonsai
        bonsai_data = {
            "title": title,
            "description": description
        }
        
        bonsai = await supabase_service.create_bonsai(user_id, bonsai_data)
        
        # Then upload the image for this bonsai
        await supabase_service.upload_bonsai_image(
            str(bonsai.id),
            user_id,
            file_content,
            file.filename
        )
        
        # Return the bonsai with the image
        return await supabase_service.get_bonsai(str(bonsai.id), user_id)
    except Exception as e:
        # Log the error for debugging
        print(f"Error in create_bonsai_with_image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create bonsai with image: {str(e)}"
        )

@router.delete("/{bonsai_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bonsai_image(bonsai_id: UUID4, image_id: UUID4, authorization: str = Header(None)):
    auth = await get_authorization(authorization)
    user_id = await supabase_service.get_user_id(auth)
    await supabase_service.delete_bonsai_image(str(bonsai_id), str(image_id), user_id)
    return None
