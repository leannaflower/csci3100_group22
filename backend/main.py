from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import tasks as tasks_router
from routers import auth as auth_router
from routers import license as license_router  
from models import init_db  

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://8.217.112.161:8000",
]

app = FastAPI(title="Simple Login API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # 自动建表
    init_db()

@app.get("/health")
def health():
    return {"status": "ok"}

# 注册路由
app.include_router(auth_router.router)
app.include_router(license_router.router)
app.include_router(tasks_router.router)