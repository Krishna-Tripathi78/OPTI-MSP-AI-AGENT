from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import websocket, ai_analytics, integrations, otp
from app.database.connection import connect_to_mongodb, close_mongodb_connection
from app.routers import auth, chat, dashboard, team, clients, anomalies, forgot_password, licenses


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongodb()
    yield
    await close_mongodb_connection()


app = FastAPI(
    title="OptiMSP API",
    description="AI-powered MSP Dashboard Backend with Azure OpenAI and MongoDB",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
        "https://optimsp-ksmsji9vj-krishna-tripathi78s-projects.vercel.app",
        "https://*.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(forgot_password.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(team.router)
app.include_router(clients.router)
app.include_router(anomalies.router)
app.include_router(licenses.router)
app.include_router(websocket.router)
app.include_router(ai_analytics.router)
app.include_router(integrations.router)
app.include_router(otp.router)


@app.get("/")
async def root():
    return {
        "message": "OptiMSP API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
