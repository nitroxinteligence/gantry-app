import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import briefing, chat, health, voice
from app.services.briefing_service import check_and_generate_briefings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    scheduler.add_job(
        check_and_generate_briefings,
        "interval",
        minutes=1,
        id="briefing_cron",
        replace_existing=True,
    )
    scheduler.start()
    logging.info("APScheduler started - briefing cron ativo")
    yield
    scheduler.shutdown()
    logging.info("APScheduler stopped")


app = FastAPI(
    title="Builders Performance - AI Assistant API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(briefing.router)
app.include_router(voice.router)
app.include_router(health.router)
