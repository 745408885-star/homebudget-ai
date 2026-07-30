from fastapi import FastAPI

from app.api.routes.budget import router as budget_router

app = FastAPI(
    title="HomeBudget AI API (Alpha)",
    description=(
        "Legacy V1 budget API. The modular V2 planner is an unconnected "
        "Alpha interaction prototype."
    ),
    version="0.1.0-alpha.1",
)
app.include_router(budget_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
