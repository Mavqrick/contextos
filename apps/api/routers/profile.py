from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db

router = APIRouter(prefix="/profile", tags=["profile"])

class Goal(BaseModel):
    title: str
    deadline: str = ""
    description: str = ""

class Project(BaseModel):
    name: str
    status: str = "active"
    tags: list[str] = []

class ProfileRequest(BaseModel):
    goals: list[Goal] = []
    projects: list[Project] = []
    interests: list[str] = []
    working_style: str = ""
    user_id: str = "00000000-0000-0000-0000-000000000001"

@router.get("/")
async def get_profile(
    user_id: str = "00000000-0000-0000-0000-000000000001",
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("SELECT * FROM context_profiles WHERE user_id = CAST(:user_id AS uuid)"),
        {"user_id": user_id}
    )
    row = result.fetchone()

    if not row:
        return {"goals": [], "projects": [], "interests": [], "working_style": ""}

    return {
        "goals": row.active_goals or [],
        "projects": row.active_projects or [],
        "interests": row.interests or [],
        "working_style": row.working_style or ""
    }

@router.post("/")
async def save_profile(payload: ProfileRequest, db: AsyncSession = Depends(get_db)):
    # Check if profile exists
    result = await db.execute(
        text("SELECT id FROM context_profiles WHERE user_id = CAST(:user_id AS uuid)"),
        {"user_id": payload.user_id}
    )
    existing = result.fetchone()

    goals_json = [g.dict() for g in payload.goals]
    projects_json = [p.dict() for p in payload.projects]

    if existing:
        await db.execute(
            text("""
                UPDATE context_profiles 
                SET active_goals = CAST(:goals AS jsonb),
                    active_projects = CAST(:projects AS jsonb),
                    interests = :interests,
                    working_style = :working_style,
                    updated_at = NOW()
                WHERE user_id = CAST(:user_id AS uuid)
            """),
            {
                "goals": str(goals_json).replace("'", '"'),
                "projects": str(projects_json).replace("'", '"'),
                "interests": payload.interests,
                "working_style": payload.working_style,
                "user_id": payload.user_id
            }
        )
    else:
        await db.execute(
            text("""
                INSERT INTO context_profiles (user_id, active_goals, active_projects, interests, working_style)
                VALUES (
                    CAST(:user_id AS uuid),
                    CAST(:goals AS jsonb),
                    CAST(:projects AS jsonb),
                    :interests,
                    :working_style
                )
            """),
            {
                "goals": str(goals_json).replace("'", '"'),
                "projects": str(projects_json).replace("'", '"'),
                "interests": payload.interests,
                "working_style": payload.working_style,
                "user_id": payload.user_id
            }
        )

    await db.commit()
    return {"message": "Profile saved successfully"}