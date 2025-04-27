import os
import openai
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from fastapi import HTTPException, status

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai_api_key = os.environ.get("OPENAI_API_KEY")
if openai_api_key:
    openai.api_key = openai_api_key


class OpenAIService:
    """Service for interacting with OpenAI API for bonsai care insights."""
    
    def __init__(self):
        """Initialize the OpenAI service."""
        if not openai_api_key:
            raise ValueError("OpenAI API key not configured")
        
        self.model = "gpt-4"  # Default model, can be configured
    
    async def generate_bonsai_insight(
        self, 
        question: str, 
        bonsai_data: Dict[str, Any], 
        image_urls: Optional[List[str]] = None
    ) -> str:
        """
        Generate an AI insight for a bonsai care question.
        
        Args:
            question: The user's question about bonsai care
            bonsai_data: Dictionary containing bonsai details (title, description, etc.)
            image_urls: Optional list of image URLs for the bonsai
            
        Returns:
            The AI-generated response
        
        Raises:
            HTTPException: If there's an error generating the insight
        """
        try:
            # Prepare context for AI
            context = self._build_context(bonsai_data, image_urls)
            
            # Generate AI response
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a bonsai expert assistant. Provide helpful, accurate advice about bonsai care, styling, and maintenance. Your responses should be informative, practical, and tailored to the specific bonsai being discussed."
                    },
                    {
                        "role": "user", 
                        "content": f"{context}\nUser question: {question}"
                    }
                ],
                max_tokens=1000,
                temperature=0.7,  # Balanced between creativity and accuracy
                top_p=0.9,
                frequency_penalty=0.0,
                presence_penalty=0.6  # Encourage variety in responses
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating AI insight: {str(e)}"
            )
    
    async def analyze_bonsai_image(self, image_url: str) -> Dict[str, Any]:
        """
        Analyze a bonsai image and provide insights.
        
        Args:
            image_url: URL of the bonsai image to analyze
            
        Returns:
            Dictionary with analysis results
            
        Raises:
            HTTPException: If there's an error analyzing the image
        """
        try:
            # Generate AI response for image analysis
            response = openai.ChatCompletion.create(
                model="gpt-4-vision-preview",  # Vision model for image analysis
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a bonsai expert assistant. Analyze the bonsai image and provide insights about its style, health, and potential improvements."
                    },
                    {
                        "role": "user", 
                        "content": [
                            {"type": "text", "text": "Please analyze this bonsai image and provide insights:"},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            analysis = response.choices[0].message.content
            
            # Structure the analysis
            return {
                "analysis": analysis,
                "image_url": image_url
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error analyzing bonsai image: {str(e)}"
            )
    
    async def generate_care_schedule(self, bonsai_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a care schedule for a bonsai.
        
        Args:
            bonsai_data: Dictionary containing bonsai details
            
        Returns:
            Dictionary with care schedule information
            
        Raises:
            HTTPException: If there's an error generating the schedule
        """
        try:
            # Prepare context
            context = self._build_context(bonsai_data)
            
            # Generate AI response
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "You are a bonsai expert assistant. Create a detailed care schedule for the bonsai, including watering, fertilizing, pruning, and seasonal care."
                    },
                    {
                        "role": "user", 
                        "content": f"{context}\nPlease create a care schedule for this bonsai."
                    }
                ],
                max_tokens=1500
            )
            
            schedule = response.choices[0].message.content
            
            return {
                "bonsai_id": bonsai_data.get("id"),
                "care_schedule": schedule
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating care schedule: {str(e)}"
            )
    
    def _build_context(
        self, 
        bonsai_data: Dict[str, Any], 
        image_urls: Optional[List[str]] = None
    ) -> str:
        """
        Build context information for the AI based on bonsai data.
        
        Args:
            bonsai_data: Dictionary containing bonsai details
            image_urls: Optional list of image URLs
            
        Returns:
            Formatted context string
        """
        title = bonsai_data.get("title", "Unnamed Bonsai")
        description = bonsai_data.get("description", "No description provided")
        
        context = f"Bonsai Title: {title}\nDescription: {description}\n"
        
        if image_urls and len(image_urls) > 0:
            context += f"This bonsai has {len(image_urls)} images uploaded.\n"
        
        return context
