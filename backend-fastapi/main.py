from fastapi import FastAPI
print('Starting backend server (main.py)')
from routers import bonsai, ai_care
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="BonsaiWay API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(bonsai.router, prefix="/api/bonsais")
app.include_router(ai_care.router, prefix="/api/bonsais")

@app.get("/")
async def root():
    return {"message": "Welcome to BonsaiWay API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
