from datetime import timezone
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, and_
from sqlalchemy.orm import Session

from models import Task, get_db
from routers.auth import get_current_user, oauth2_scheme  # 若与 main.py 同项目根目录，请确保可导入

router = APIRouter(prefix="/api/v1/tasks", tags=["Tasks"])

# 允许的列
COLUMNS = {"To Do", "Doing", "Done"}

# 通用响应包装
def ok(data=None, message: Optional[str] = None, count: Optional[int] = None):
    resp = {"success": True}
    if data is not None:
        resp["data"] = data
    if message:
        resp["message"] = message
    if count is not None:
        resp["count"] = count
    return resp

def err(message: str, code: str, details: Optional[dict] = None, http_status: int = 400):
    raise HTTPException(
        status_code=http_status,
        detail={
            "success": False,
            "error": {"message": message, "code": code, "details": details or {}},
        },
    )

# 工具：时间戳转 ISO 8601（Z）
def to_iso(dt) -> str:
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")

# 工具：将 Task 模型转 API 字典
def task_to_dict(t: Task) -> dict:
    return {
        "id": str(t.id),
        "title": t.title,
        "description": t.description or "",
        "column": t.column_name,
        "completed": bool(t.completed),
        "createdAt": to_iso(t.created_at),
        "updatedAt": to_iso(t.updated_at),
    }

# 请求
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    column: Optional[str] = Field(default="To Do")

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    column: Optional[str] = None
    completed: Optional[bool] = None

class MoveRequest(BaseModel):
    column: str = Field(...)

def normalize_column(col: Optional[str]) -> str:
    if not col:
        return "To Do"
    col = col.strip()
    if col not in COLUMNS:
        err("Validation error", "VALIDATION_ERROR", details={"column": "Column must be 'To Do' | 'Doing' | 'Done'"}, http_status=400)
    return col

def normalize_title(title: Optional[str]) -> Optional[str]:
    if title is None:
        return None
    t = title.strip()
    if not t:
        err("Validation error", "VALIDATION_ERROR", details={"title": "Title is required"}, http_status=400)
    return t

# 获取任务
def get_task_or_404(db: Session, user_id: int, task_id: int) -> Task:
    task = db.get(Task, task_id)
    if not task or task.user_id != user_id:
        err("Task not found", "TASK_NOT_FOUND", http_status=404)
    return task

# 1) GET /api/v1/tasks
@router.get("")
def list_tasks(
    completed: Optional[bool] = Query(default=None),
    column: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    filters = [Task.user_id == current_user.id]
    if completed is not None:
        filters.append(Task.completed == completed)
    if column is not None:
        if column not in COLUMNS:
            err("Validation error", "VALIDATION_ERROR", details={"column": "Column must be 'To Do' | 'Doing' | 'Done'"}, http_status=400)
        filters.append(Task.column_name == column)
    q = select(Task).where(and_(*filters)).order_by(Task.created_at.desc())
    rows = db.execute(q).scalars().all()
    data = [task_to_dict(t) for t in rows]
    return ok(data=data, count=len(data))

# 2) GET /api/v1/tasks/:id
@router.get("/{task_id}")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = get_task_or_404(db, current_user.id, task_id)
    return ok(data=task_to_dict(t))

# 3) POST /api/v1/tasks
@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    title = normalize_title(payload.title)
    column = normalize_column(payload.column)
    # 规则：列为 Done -> completed=true，否则 false
    completed = column == "Done"

    t = Task(
        user_id=current_user.id,
        title=title,
        description=(payload.description or "").strip() if payload.description else None,
        column_name=column,
        completed=completed,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return ok(message="Task created successfully", data=task_to_dict(t))

# 4) PATCH /api/v1/tasks/:id
@router.patch("/{task_id}")
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = get_task_or_404(db, current_user.id, task_id)

    has_any = any([
        payload.title is not None,
        payload.description is not None,
        payload.column is not None,
        payload.completed is not None,
    ])
    if not has_any:
        err("Validation error", "VALIDATION_ERROR", details={"_": "At least one field must be provided"}, http_status=400)

    if payload.title is not None:
        t.title = normalize_title(payload.title)
    if payload.description is not None:
        t.description = payload.description.strip() if payload.description is not None else None
    if payload.column is not None:
        t.column_name = normalize_column(payload.column)
        # 列变化时同步 completed
        t.completed = (t.column_name == "Done")
    if payload.completed is not None:
        # 若明确传 completed，也需与业务一致：当列为 Done，completed 必须 true；非 Done 必须 false
        if t.column_name == "Done":
            t.completed = True
        else:
            t.completed = False

    db.commit()
    db.refresh(t)
    return ok(message="Task updated successfully", data=task_to_dict(t))

# 5) DELETE /api/v1/tasks/:id
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = get_task_or_404(db, current_user.id, task_id)
    db.delete(t)
    db.commit()
    return ok(message="Task deleted successfully")

# 6) PATCH /api/v1/tasks/:id/toggle
@router.patch("/{task_id}/toggle")
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = get_task_or_404(db, current_user.id, task_id)
    # 规则：在 Done 与 To Do 之间切换；如果当前 Doing，则切到 Done
    if t.column_name == "Done":
        t.column_name = "To Do"
        t.completed = False
    else:
        t.column_name = "Done"
        t.completed = True
    db.commit()
    db.refresh(t)
    return ok(message="Task status updated", data=task_to_dict(t))

# 7) PATCH /api/v1/tasks/:id/move
@router.patch("/{task_id}/move")
def move_task(
    task_id: int,
    payload: MoveRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    t = get_task_or_404(db, current_user.id, task_id)
    target = normalize_column(payload.column)
    t.column_name = target
    t.completed = (target == "Done")
    db.commit()
    db.refresh(t)
    return ok(message="Task moved successfully", data=task_to_dict(t))