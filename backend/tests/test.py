#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSCI2720 HW3 一键端到端测试（Python 版本，不含 7E）
依赖：requests
安装：pip install requests
运行：python test_hw3.py
可配置环境变量：
  BASE_URL  默认 http://localhost:3000
  TIMEOUT   服务可用性等待秒数，默认 20
"""

import json
import os
import random
import sys
import time
from typing import Any, Dict, Optional, Tuple

import requests


BASE_URL = os.getenv("BASE_URL", "http://localhost:3000").rstrip("/")
TIMEOUT = int(os.getenv("TIMEOUT", "20"))

pass_count = 0
fail_count = 0
case_no = 0


def color(text: str, c: str) -> str:
    codes = {"red": "31", "green": "32", "yellow": "33"}
    return f"\033[{codes[c]}m{text}\033[0m"


def ok(msg: str):
    global pass_count
    print(color(f"  ✓ {msg}", "green"))
    pass_count += 1


def fail(msg: str):
    global fail_count
    print(color(f"  ✗ {msg}", "red"))
    fail_count += 1


def step(title: str):
    global case_no
    case_no += 1
    print()
    print(color(f"=== 用例 #{case_no}: {title} ===", "yellow"))


def wait_for_service() -> None:
    print(f"[Init] 等待服务可用：{BASE_URL} （最长 {TIMEOUT}s）")
    start = time.time()
    while True:
        try:
            r = requests.get(BASE_URL, timeout=2)
            if r.status_code < 500:
                print(color("[Init] 服务已可用", "green"))
                return
        except requests.RequestException:
            pass
        if time.time() - start >= TIMEOUT:
            print(color(f"[Init] 超时：无法访问 {BASE_URL}", "red"))
            sys.exit(1)
        time.sleep(1)


def request_json(method: str, path: str, data: Optional[Dict[str, Any]] = None) -> Tuple[int, str, Optional[Any]]:
    url = f"{BASE_URL}{path}"
    headers = {"Accept": "*/*"}
    try:
        if data is not None:
            headers["Content-Type"] = "application/json"
            resp = requests.request(method, url, data=json.dumps(data), headers=headers, timeout=10)
        else:
            resp = requests.request(method, url, headers=headers, timeout=10)
    except requests.RequestException as e:
        return 0, f"{e}", None
    body = resp.text
    parsed = None
    try:
        # 服务使用 text/plain 返回类 JSON，这里尝试解析
        parsed = json.loads(body)
    except Exception:
        parsed = None
    return resp.status_code, body, parsed


def assert_status(actual: int, expected: int, msg: str):
    if actual == expected:
        ok(f"{msg} (status={actual})")
    else:
        fail(f"{msg} (expected={expected}, got={actual})")


def assert_field(parsed: Any, path: str, expected: Any):
    """
    简易 JSON 路径断言，支持 .a.b[0].c 形式
    """
    cur = parsed
    try:
        tokens = []
        buf = ""
        i = 0
        while i < len(path):
            ch = path[i]
            if ch == ".":
                if buf:
                    tokens.append(buf)
                    buf = ""
            elif ch == "[":
                if buf:
                    tokens.append(buf)
                    buf = ""
                j = path.find("]", i)
                idx = int(path[i + 1 : j])
                tokens.append(idx)
                i = j
            else:
                buf += ch
            i += 1
        if buf:
            tokens.append(buf)

        for t in tokens:
            if isinstance(t, int):
                cur = cur[t]
            else:
                cur = cur[t]
        if cur == expected:
            ok(f"字段断言 {path} == {expected}")
        else:
            fail(f"字段断言失败 {path}: expected={expected}, got={cur}")
    except Exception as e:
        fail(f"字段断言异常 {path}: {e}")


def main():
    print(f"[Info] 基础地址：{BASE_URL}")
    wait_for_service()

    # 用例 1: GET /ev 列表
    step("GET /ev 列表")
    code, body, parsed = request_json("GET", "/ev")
    assert_status(code, 200, "GET /ev 应返回 200")
    if isinstance(parsed, list):
        ok("/ev 返回数组")
    else:
        fail("/ev 响应体不是数组")

    # 选一个 eventId（若数组为空，后续会创建）
    test_event_id = None
    if isinstance(parsed, list) and parsed:
        try:
            test_event_id = parsed[0]["eventId"]
        except Exception:
            pass

    # 用例 2: 若已有 eventId，GET /ev/:eventId
    if test_event_id is not None:
        step(f"GET /ev/{test_event_id} 详情")
        code, body, parsed2 = request_json("GET", f"/ev/{test_event_id}")
        assert_status(code, 200, "GET /ev/:eventId 应返回 200")
        if isinstance(parsed2, dict):
            assert_field(parsed2, "eventId", test_event_id)
        else:
            fail("GET /ev/:eventId 返回不是对象")

    # 用例 3: GET /lo 列表
    step("GET /lo 列表")
    code, body, lo_list = request_json("GET", "/lo")
    assert_status(code, 200, "GET /lo 应返回 200")
    if isinstance(lo_list, list):
        ok("/lo 返回数组")
    else:
        fail("/lo 响应体不是数组")

    # 选 locId 与 locName
    test_loc_id = None
    test_loc_name = None
    if isinstance(lo_list, list) and lo_list:
        first_lo = lo_list[0]
        test_loc_id = first_lo.get("locId")
        test_loc_name = first_lo.get("name")

    # 用例 4: GET /lo/name/:name
    if test_loc_name:
        step(f"GET /lo/name/{test_loc_name}")
        code, body, lo_by_name = request_json("GET", f"/lo/name/{requests.utils.quote(test_loc_name)}")
        assert_status(code, 200, "GET /lo/name/:name 应返回 200")
        if isinstance(lo_by_name, dict):
            assert_field(lo_by_name, "name", test_loc_name)
        else:
            fail("GET /lo/name/:name 返回不是对象")

    # 用例 5: GET /ev/by_loc_id/:locId
    if test_loc_id is not None:
        step(f"GET /ev/by_loc_id/{test_loc_id}")
        code, body, ev_by_loc = request_json("GET", f"/ev/by_loc_id/{test_loc_id}")
        assert_status(code, 200, "GET /ev/by_loc_id/:locId 应返回 200")
        if isinstance(ev_by_loc, list):
            ok("/ev/by_loc_id 返回数组")
        else:
            fail("/ev/by_loc_id 响应体不是数组")
    else:
        print(color("  - 无可用 locId，跳过 /ev/by_loc_id 测试", "yellow"))

    # 生成一个新 eventId，避免冲突
    new_event_id = random.randint(1000, 9999)
    new_event_name = f"Auto Test Event {new_event_id}"
    if test_loc_id is None:
        # 若无 locId，先降级从 /lo 再取一次，否则设为 1（假定种子）
        test_loc_id = 1

    # 用例 6: POST /ev 创建
    step("POST /ev 创建新活动")
    post_body = {"eventId": new_event_id, "name": new_event_name, "locId": test_loc_id, "quota": 50}
    code, body, parsed_post = request_json("POST", "/ev", post_body)
    assert_status(code, 201, "POST /ev 应返回 201")
    # 期望返回 "http://.../ev/<id>" 字符串
    try:
        url_str = json.loads(body)
        if isinstance(url_str, str) and f"/ev/{new_event_id}" in url_str:
            ok("创建返回包含资源 URL")
        else:
            fail(f"创建返回不包含资源 URL: {url_str}")
    except Exception:
        fail("创建返回非 JSON 字符串")

    # 用例 7: 冲突创建（重复 eventId）
    step("POST /ev 重复 eventId 应冲突")
    code, body, _ = request_json("POST", "/ev", post_body)
    assert_status(code, 409, "重复创建应 409")

    # 用例 8: PUT /ev/:eventId 更新
    step(f"PUT /ev/{new_event_id} 更新")
    new_name = f"Updated Name {new_event_id}"
    put_body = {"name": new_name, "quota": 99, "locId": test_loc_id}
    code, body, parsed_put = request_json("PUT", f"/ev/{new_event_id}", put_body)
    assert_status(code, 200, "PUT /ev/:eventId 应返回 200")
    if isinstance(parsed_put, dict):
        assert_field(parsed_put, "name", new_name)
        assert_field(parsed_put, "eventId", new_event_id)
    else:
        fail("PUT 返回不是对象")

    # 用例 9: DELETE /ev/:eventId 删除
    step(f"DELETE /ev/{new_event_id} 删除")
    code, body, _ = request_json("DELETE", f"/ev/{new_event_id}")
    assert_status(code, 204, "DELETE /ev/:eventId 应返回 204")

    # 用例 10: DELETE 不存在的活动
    step("DELETE /ev/999999 不存在的活动")
    code, body, _ = request_json("DELETE", "/ev/999999")
    assert_status(code, 404, "删除不存在活动应 404")

    # 用例 11: GET 已删除活动应 404
    step(f"GET /ev/{new_event_id} 已删除验证")
    code, body, _ = request_json("GET", f"/ev/{new_event_id}")
    assert_status(code, 404, "已删除活动再查应 404")

    # 汇总
    print()
    print(color("=== 测试完成 ===", "yellow"))
    print(f"通过用例: {pass_count}")
    print(f"失败用例: {fail_count}")
    if fail_count == 0:
        print(color("所有断言均通过 ✅", "green"))
        sys.exit(0)
    else:
        print(color("存在失败断言 ❌", "red"))
        sys.exit(1)


if __name__ == "__main__":
    main()