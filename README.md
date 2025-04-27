# BonsaiWay

A platform for bonsai enthusiasts and practitioners.

## Project Structure

```
BonsaiWay/
├── frontend-nextjs/     # Next.js frontend with Tailwind CSS
└── backend-fastapi/     # FastAPI backend
    ├── env/            # Python virtual environment
    ├── main.py         # Main FastAPI application
    └── requirements.txt # Python dependencies
```

## Frontend (Next.js)

The frontend is built with Next.js and Tailwind CSS.

### Running the Frontend

```bash
cd frontend-nextjs
npm run dev
```

## Backend (FastAPI)

The backend is built with FastAPI and connects to Supabase.

### Running the Backend

```bash
cd backend-fastapi
source env/bin/activate  # On Windows: env\Scripts\activate
python -m uvicorn main:app --reload
```

## Supabase Integration

This project uses Supabase for:
- Authentication (email/password and OAuth)
- Database for storing bonsai data
- Storage for images

### Connecting to Supabase

1. Create a `.env` file in the backend-fastapi directory based on `.env.example`
2. Add your Supabase URL and API key

## License

This project is licensed under the MIT License - see the LICENSE file for details.
