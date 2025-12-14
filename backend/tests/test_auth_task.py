import random
import string
from typing import Dict, Any, Optional, Union

import pytest
import requests

BASE_URL = "http://8.217.112.161:8000"

session = requests.Session()


def rand_str(prefix="u", n=8):
    return prefix + "".join(random.choices(string.ascii_lowercase + string.digits, k=n))


def register_user(username: str, email: str, password: str) -> Dict[str, Any]:
    resp = session.post(
        f"{BASE_URL}/auth/register",
        json={"username": username, "email": email, "password": password},
        timeout=10,
    )
    # 你的注册接口：200 正常；若已存在可能返回 400
    assert resp.status_code in (200, 400), f"Unexpected status {resp.status_code}: {resp.text}"
    # 有些情况下返回可能非 JSON，这里做个兜底
    try:
        return resp.json()
    except Exception:
        return {"raw": resp.text, "status_code": resp.status_code}


def login_user(username_or_email: str, password: str) -> Dict[str, Any]:
    resp = session.post(
        f"{BASE_URL}/auth/login",
        json={"username": username_or_email, "password": password},
        timeout=10,
    )
    return {"status_code": resp.status_code, "json": safe_json(resp)}


def auth_headers(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def safe_json(resp: requests.Response) -> Dict[str, Any]:
    try:
        return resp.json()
    except Exception:
        return {"_non_json_body": resp.text, "_status": resp.status_code}


@pytest.fixture(scope="module")
def user_tokens():
    """
    创建一个测试用户，并返回 access/refresh token。
    如果用户名或邮箱已存在，将直接用 login 获取 token。
    """
    username = rand_str("user_")
    email = f"{username}@example.com"
    password = "P@ssw0rd123"

    reg = register_user(username, email, password)
    if reg and isinstance(reg, dict) and "access_token" in reg:
        return {
            "username": username,
            "email": email,
            "password": password,
            "access_token": reg["access_token"],
            "refresh_token": reg["refresh_token"],
        }
    # 已存在则尝试登录
    login = login_user(username, password)
    assert login["status_code"] == 200, f"Login failed: {login}"
    return {
        "username": username,
        "email": email,
        "password": password,
        "access_token": login["json"]["access_token"],
        "refresh_token": login["json"]["refresh_token"],
    }


def test_health():
    r = session.get(f"{BASE_URL}/health", timeout=10)
    assert r.status_code == 200
    assert safe_json(r).get("status") == "ok"


def test_me_unauthorized():
    r = session.get(f"{BASE_URL}/users/me", timeout=10)
    assert r.status_code in (401, 403)


def test_login_wrong_password(user_tokens):
    resp = session.post(
        f"{BASE_URL}/auth/login",
        json={"username": user_tokens["username"], "password": "WRONG"},
        timeout=10,
    )
    assert resp.status_code == 401
    body = safe_json(resp)
    assert "detail" in body


def test_get_current_user(user_tokens):
    r = session.get(f"{BASE_URL}/users/me", headers=auth_headers(user_tokens["access_token"]), timeout=10)
    assert r.status_code == 200
    j = safe_json(r)
    assert "id" in j and "email" in j and "username" in j


def test_refresh_token(user_tokens):
    r = session.post(
        f"{BASE_URL}/auth/refresh",
        json={"refresh_token": user_tokens["refresh_token"]},
        timeout=10,
    )
    assert r.status_code == 200
    j = safe_json(r)
    assert "access_token" in j and "refresh_token" in j


# ---- 任务相关辅助方法 ----

def create_task(token: str, data: Dict[str, Any]):
    r = session.post(f"{BASE_URL}/api/v1/tasks", headers=auth_headers(token), json=data, timeout=10)
    return r

def get_tasks(token: str, params: Optional[Dict[str, Any]] = None):
    r = session.get(f"{BASE_URL}/api/v1/tasks", headers=auth_headers(token), params=params or {}, timeout=10)
    return r

def get_task(token: str, task_id: Union[str, int]):
    r = session.get(f"{BASE_URL}/api/v1/tasks/{task_id}", headers=auth_headers(token), timeout=10)
    return r

def update_task(token: str, task_id: Union[str, int], data: Dict[str, Any]):
    r = session.patch(f"{BASE_URL}/api/v1/tasks/{task_id}", headers=auth_headers(token), json=data, timeout=10)
    return r

def delete_task(token: str, task_id: Union[str, int]):
    r = session.delete(f"{BASE_URL}/api/v1/tasks/{task_id}", headers=auth_headers(token), timeout=10)
    return r

def move_task(token: str, task_id: Union[str, int], column: str):
    r = session.patch(
        f"{BASE_URL}/api/v1/tasks/{task_id}/move",
        headers=auth_headers(token),
        json={"column": column},
        timeout=10,
    )
    return r

def toggle_task(token: str, task_id: Union[str, int]):
    r = session.patch(f"{BASE_URL}/api/v1/tasks/{task_id}/toggle", headers=auth_headers(token), timeout=10)
    return r


def assert_success_response(resp: requests.Response, expected_status=200):
    assert resp.status_code == expected_status, f"status={resp.status_code}, body={resp.text}"
    j = safe_json(resp)
    assert j.get("success") is True, f"Unexpected body: {j}"
    return j

def assert_error_response(resp: requests.Response, expected_status, code: Optional[str] = None):
    assert resp.status_code == expected_status, f"status={resp.status_code}, body={resp.text}"
    j = safe_json(resp)
    payload = j if "success" in j else j.get("detail", {})
    assert isinstance(payload, dict), f"Unexpected error payload: {j}"
    assert payload.get("success") is False, f"Unexpected payload: {payload}"
    if code:
        assert payload.get("error", {}).get("code") == code, f"Unexpected error code: {payload}"
    return payload


# ---- 任务流程测试 ----

@pytest.fixture
def task_payload_todo():
    return {
        "title": "Test task " + rand_str("t_", 4),
        "description": "This is a test task",
        "column": "To Do",
    }

@pytest.fixture
def task_payload_done():
    return {
        "title": "Done task " + rand_str("t_", 4),
        "description": "This is a done task",
        "column": "Done",
    }

def test_tasks_crud_flow(user_tokens, task_payload_todo):
    token = user_tokens["access_token"]

    # 初始列表
    r = get_tasks(token)
    j = assert_success_response(r)
    before_count = j.get("count", len(j.get("data", [])))

    # 创建任务（To Do，应 completed=false）
    r = create_task(token, task_payload_todo)
    j = assert_success_response(r, expected_status=201)
    created = j["data"]
    assert created["title"] == task_payload_todo["title"]
    assert created["column"] == "To Do"
    assert created["completed"] is False
    task_id = created["id"]

    # 获取任务详情
    r = get_task(token, task_id)
    j = assert_success_response(r)
    got = j["data"]
    assert got["id"] == task_id

    r = get_tasks(token)
    j = assert_success_response(r)
    after_count = j.get("count", len(j.get("data", [])))
    assert after_count == before_count + 1

    r = update_task(token, task_id, {"title": "Updated Title", "description": "Updated Desc", "column": "Doing"})
    j = assert_success_response(r)
    updated = j["data"]
    assert updated["title"] == "Updated Title"
    assert updated["description"] == "Updated Desc"
    assert updated["column"] == "Doing"
    assert updated["completed"] is False

    # 移动任务到 Done（completed -> true）
    r = move_task(token, task_id, "Done")
    j = assert_success_response(r)
    moved = j["data"]
    assert moved["column"] == "Done"
    assert moved["completed"] is True

    # toggle：在 Done<->To Do 间切换
    r = toggle_task(token, task_id)
    j = assert_success_response(r)
    toggled = j["data"]
    assert toggled["column"] in ("To Do", "Done")
    if toggled["column"] == "To Do":
        assert toggled["completed"] is False
    else:
        assert toggled["completed"] is True

    r = delete_task(token, task_id)
    j = assert_success_response(r)
    assert "message" in j

    # 再获取应 404
    r = get_task(token, task_id)
    _ = assert_error_response(r, expected_status=404, code="TASK_NOT_FOUND")


def test_create_done_task_sets_completed_true(user_tokens, task_payload_done):
    token = user_tokens["access_token"]

    r = create_task(token, task_payload_done)
    j = assert_success_response(r, expected_status=201)
    t = j["data"]
    assert t["column"] == "Done"
    assert t["completed"] is True

    # 清理
    delete_task(token, t["id"])


def test_list_filters(user_tokens):
    token = user_tokens["access_token"]

    # 创建三个任务：To Do、Doing、Done
    ids = []
    for col in ("To Do", "Doing", "Done"):
        r = create_task(token, {"title": f"Filter {col} {rand_str()}", "column": col})
        j = assert_success_response(r, expected_status=201)
        ids.append(j["data"]["id"])

    r = get_tasks(token, params={"column": "Doing"})
    j = assert_success_response(r)
    for t in j["data"]:
        assert t["column"] == "Doing"
    r = get_tasks(token, params={"completed": "true"})
    j = assert_success_response(r)
    for t in j["data"]:
        assert t["completed"] is True
    for tid in ids:
        delete_task(token, tid)


def test_validation_errors(user_tokens):
    token = user_tokens["access_token"]

    # 标题为空
    r = create_task(token, {"title": "   "})
    _ = assert_error_response(r, expected_status=400, code="VALIDATION_ERROR")

    # 列名非法
    r = create_task(token, {"title": "X", "column": "Unknown"})
    _ = assert_error_response(r, expected_status=400, code="VALIDATION_ERROR")

    # 更新无字段
    # 先创建任务
    r = create_task(token, {"title": "U1"})
    j = assert_success_response(r, expected_status=201)
    tid = j["data"]["id"]

    r = update_task(token, tid, {})
    _ = assert_error_response(r, expected_status=400, code="VALIDATION_ERROR")

    delete_task(token, tid)


def test_unauthorized_access():
    r = requests.get(f"{BASE_URL}/api/v1/tasks", timeout=10)
    assert r.status_code in (401, 403)

    r = requests.post(f"{BASE_URL}/api/v1/tasks", json={"title": "noauth"}, timeout=10)
    assert r.status_code in (401, 403)