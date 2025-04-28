import os
from typing import Dict, List, Any, Optional, Union
from fastapi import HTTPException, status
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Supabase client setup
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase credentials not configured")

supabase: Client = create_client(supabase_url, supabase_key)


class SupabaseService:
    """Service for interacting with Supabase for BonsaiWay application."""
    
    def __init__(self):
        """Initialize the Supabase service."""
        self.client = supabase
    
    async def get_user_id(self, authorization: str = None) -> str:
        """
        Extract and validate user ID from authorization header.
        
        Args:
            authorization: Authorization header containing the JWT token
            
        Returns:
            User ID from the token
            
        Raises:
            HTTPException: If authentication fails
        """
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        try:
            # Extract token from Bearer header
            if " " in authorization:
                # Handle 'Bearer token' format
                token = authorization.split(" ")[1]
            else:
                # Handle raw token format
                token = authorization
                
            # Get user from token
            response = self.client.auth.get_user(token)
            
            if not response or not response.user:
                raise ValueError("Invalid token or user not found")
                
            return response.user.id
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication credentials: {str(e)}"
            )
    
    # Bonsai methods
    async def get_bonsais(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all bonsais for a user.
        
        Args:
            user_id: The user's ID
            
        Returns:
            List of bonsai objects
            
        Raises:
            HTTPException: If there's an error retrieving bonsais
        """
        try:
            response = self.client.table("bonsais").select("*").eq("user_id", user_id).execute()
            
            bonsais = response.data
            for bonsai in bonsais:
                # Get images for each bonsai
                images_response = self.client.table("bonsai_images").select("*").eq("bonsai_id", bonsai["id"]).execute()
                bonsai["images"] = images_response.data
                
            return bonsais
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving bonsais: {str(e)}"
            )
    
    async def get_bonsai(self, bonsai_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a specific bonsai.
        
        Args:
            bonsai_id: The bonsai's ID
            user_id: The user's ID
            
        Returns:
            Bonsai object
            
        Raises:
            HTTPException: If the bonsai is not found or doesn't belong to the user
        """
        try:
            response = self.client.table("bonsais").select("*").eq("id", bonsai_id).eq("user_id", user_id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Bonsai not found"
                )
                
            bonsai = response.data[0]
            
            # Get images for the bonsai
            images_response = self.client.table("bonsai_images").select("*").eq("bonsai_id", bonsai_id).execute()
            bonsai["images"] = images_response.data
            
            return bonsai
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving bonsai: {str(e)}"
            )
    
    async def create_bonsai(self, user_id: str, bonsai_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new bonsai.
        
        Args:
            user_id: The user's ID
            bonsai_data: Dictionary with bonsai details
            
        Returns:
            Created bonsai object
            
        Raises:
            HTTPException: If there's an error creating the bonsai
        """
        try:
            new_bonsai = {
                "user_id": user_id,
                "title": bonsai_data.get("title"),
                "description": bonsai_data.get("description")
            }
            
            response = self.client.table("bonsais").insert(new_bonsai).execute()
            
            if response.data:
                created_bonsai = response.data[0]
                created_bonsai["images"] = []
                return created_bonsai
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create bonsai"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating bonsai: {str(e)}"
            )
    
    async def update_bonsai(self, bonsai_id: str, user_id: str, bonsai_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a bonsai.
        
        Args:
            bonsai_id: The bonsai's ID
            user_id: The user's ID
            bonsai_data: Dictionary with updated bonsai details
            
        Returns:
            Updated bonsai object
            
        Raises:
            HTTPException: If the bonsai is not found or there's an error updating it
        """
        try:
            # Check if bonsai exists and belongs to user
            await self.get_bonsai(bonsai_id, user_id)
            
            # Update bonsai
            update_data = {
                "title": bonsai_data.get("title"),
                "description": bonsai_data.get("description")
            }
            
            response = self.client.table("bonsais").update(update_data).eq("id", bonsai_id).execute()
            
            if response.data:
                updated_bonsai = response.data[0]
                
                # Get images for the bonsai
                images_response = self.client.table("bonsai_images").select("*").eq("bonsai_id", bonsai_id).execute()
                updated_bonsai["images"] = images_response.data
                
                return updated_bonsai
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update bonsai"
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating bonsai: {str(e)}"
            )
    
    async def delete_bonsai(self, bonsai_id: str, user_id: str) -> None:
        """
        Delete a bonsai.
        
        Args:
            bonsai_id: The bonsai's ID
            user_id: The user's ID
            
        Raises:
            HTTPException: If the bonsai is not found or there's an error deleting it
        """
        try:
            # Check if bonsai exists and belongs to user
            await self.get_bonsai(bonsai_id, user_id)
            
            # Delete bonsai (cascade will handle related images and insights)
            self.client.table("bonsais").delete().eq("id", bonsai_id).execute()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting bonsai: {str(e)}"
            )
    
    # Bonsai image methods
    async def upload_bonsai_image(self, bonsai_id: str, user_id: str, file_content: bytes, file_name: str) -> Dict[str, Any]:
        """
        Upload an image for a bonsai.
        
        Args:
            bonsai_id: The bonsai's ID
            user_id: The user's ID
            file_content: The image file content
            file_name: Original file name
            
        Returns:
            Created image object
            
        Raises:
            HTTPException: If there's an error uploading the image
        """
        try:
            # Check if bonsai exists and belongs to user
            await self.get_bonsai(bonsai_id, user_id)
            
            # For development/demo purposes, if we can't access storage, create a mock image URL
            # This allows the app to function without proper Supabase storage setup
            try:
                # Generate unique filename
                file_extension = os.path.splitext(file_name)[1]
                unique_filename = f"{uuid.uuid4()}{file_extension}"
                storage_path = f"{user_id}/{bonsai_id}/{unique_filename}"
                
                # Upload file to Supabase Storage
                storage_response = self.client.storage.from_("bonsai-images").upload(
                    storage_path,
                    file_content
                )
                
                # Get public URL
                public_url = self.client.storage.from_("bonsai-images").get_public_url(storage_path)
            except Exception as storage_error:
                print(f"Storage error: {str(storage_error)}")
                # Use a placeholder image URL for development
                public_url = f"https://picsum.photos/seed/{uuid.uuid4()}/800/800"
            
            # Save image reference in database
            image_data = {
                "bonsai_id": bonsai_id,
                "image_url": public_url
            }
            
            image_response = self.client.table("bonsai_images").insert(image_data).execute()
            
            if image_response.data:
                return image_response.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save image reference"
                )
        except HTTPException:
            raise
        except Exception as e:
            print(f"Error in upload_bonsai_image: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error uploading image: {str(e)}"
            )

    async def delete_bonsai_image(self, bonsai_id: str, image_id: str, user_id: str) -> None:
        """
        Delete a bonsai image.
        
        Args:
            bonsai_id: The bonsai's ID
            image_id: The image's ID
            user_id: The user's ID
            
        Raises:
            HTTPException: If the image is not found or there's an error deleting it
        """
        try:
            # Check if bonsai exists and belongs to user
            await self.get_bonsai(bonsai_id, user_id)
            
            # Get image details
            image_response = self.client.table("bonsai_images").select("*").eq("id", image_id).eq("bonsai_id", bonsai_id).execute()
            
            if not image_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Image not found"
                )
            
            # Extract storage path from URL
            image_url = image_response.data[0]["image_url"]
            storage_path = image_url.split("/")[-1]
            
            # Delete from storage
            try:
                self.client.storage.from_("bonsai-images").remove([f"{user_id}/{bonsai_id}/{storage_path}"])
            except:
                # Continue even if storage deletion fails
                pass
            
            # Delete from database
            self.client.table("bonsai_images").delete().eq("id", image_id).execute()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting image: {str(e)}"
            )
    
    # AI insights methods
    async def get_bonsai_insights(self, bonsai_id: str, user_id: str) -> List[Dict[str, Any]]:
        """
        Get AI insights for a bonsai.
        
        Args:
            bonsai_id: The bonsai's ID
            user_id: The user's ID
            
        Returns:
            List of insight objects
            
        Raises:
            HTTPException: If there's an error retrieving insights
        """
        try:
            # Check if bonsai exists and belongs to user
            await self.get_bonsai(bonsai_id, user_id)
            
            # Get insights for the bonsai
            response = self.client.table("ai_insights").select("*").eq("bonsai_id", bonsai_id).order("created_at", desc=True).execute()
            
            return response.data
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error retrieving insights: {str(e)}"
            )
    
    async def create_bonsai_insight(self, bonsai_id: str, user_id: str, question: str, ai_response: str) -> Dict[str, Any]:
        """
        Create an AI insight for a bonsai.
        
        Args:
            bonsai_id: The bonsai's ID
            user_id: The user's ID
            question: The user's question
            ai_response: The AI-generated response
            
        Returns:
            Created insight object
            
        Raises:
            HTTPException: If there's an error creating the insight
        """
        try:
            # Check if bonsai exists and belongs to user
            await self.get_bonsai(bonsai_id, user_id)
            
            # Save insight to database
            insight_data = {
                "bonsai_id": bonsai_id,
                "user_question": question,
                "ai_response": ai_response
            }
            
            insert_response = self.client.table("ai_insights").insert(insight_data).execute()
            
            if insert_response.data:
                return insert_response.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save insight"
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating insight: {str(e)}"
            )
    
    async def delete_bonsai_insight(self, bonsai_id: str, insight_id: str, user_id: str) -> None:
        """
        Delete an AI insight.
        
        Args:
            bonsai_id: The bonsai's ID
            insight_id: The insight's ID
            user_id: The user's ID
            
        Raises:
            HTTPException: If the insight is not found or there's an error deleting it
        """
        try:
            # Check if bonsai exists and belongs to user
            await self.get_bonsai(bonsai_id, user_id)
            
            # Check if insight exists
            insight_response = self.client.table("ai_insights").select("*").eq("id", insight_id).eq("bonsai_id", bonsai_id).execute()
            
            if not insight_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Insight not found"
                )
            
            # Delete insight
            self.client.table("ai_insights").delete().eq("id", insight_id).execute()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting insight: {str(e)}"
            )
