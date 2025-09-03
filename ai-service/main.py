from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class PredictionRequest(BaseModel):
    distance_km: float
    wind_tail_component: float | None = None
    visibility_km: float | None = None


class PredictionResponse(BaseModel):
    return_probability: float
    speed_delta_pct: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    # stub: naive heuristic placeholder
    prob = 0.8
    if req.visibility_km is not None:
        prob = max(0.1, min(0.99, 0.5 + (req.visibility_km / 20)))
    speed_delta = (req.wind_tail_component or 0.0) * 0.05
    return {"return_probability": prob, "speed_delta_pct": speed_delta}

