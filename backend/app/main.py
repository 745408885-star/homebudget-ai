from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.budget import router as budget_router
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(
    title="HomeBudget AI API (Alpha)",
    description=(
        "Legacy V1 budget API. The modular V2 planner is an unconnected "
        "Alpha interaction prototype."
    ),
    version="0.1.0-alpha.1",
)
if settings.cors_allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_allowed_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
app.include_router(budget_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
