"""
main.py
-------
FastAPI application entrypoint. One backend, one database, three role-based
router groups mounted underneath it.

Run with:
    uvicorn main:app --reload --port 8000

Interactive API docs (auto-generated, great for the frontend team) will be
available at http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, provider, ngo, volunteer, dashboard

app = FastAPI(title="BhojanSetu API", version="1.0.0")

# CORS wide open: three separate frontend apps (built by a different team,
# possibly on different tools/hosts) all need to call this API from the
# browser. Fine for a hackathon prototype; would be locked down in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(provider.router)
app.include_router(ngo.router)
app.include_router(volunteer.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "BhojanSetu API is running", "docs": "/docs"}
