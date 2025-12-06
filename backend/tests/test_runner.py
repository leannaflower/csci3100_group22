import os
import sys
from pathlib import Path

import pytest


def main():
    # 可通过环境变量覆盖默认 BASE_URL（你的测试文件里现在是硬编码。
    # 如果你后续把测试文件改成从环境变量读取，就更灵活。
    # 例如：在测试文件中：
    #   import os
    #   BASE_URL = os.getenv("BASE_URL", "http://8.217.112.161:8000")
    #
    # 这里演示如何设置环境变量：
    os.environ.setdefault("BASE_URL", "http://8.217.112.161:8000")

    # 定位测试文件路径：将 file_name 替换为你的测试脚本实际文件名
    # 若文件名就是当前贴出来的这个（比如 tests/test_api_remote.py），请对应修改
    # 假设你把文件命名为 tests/test_remote_tasks.py：
    file_name = "tests/test_auth_task.py"

    test_file = Path(file_name).resolve()
    if not test_file.exists():
        print(f"[ERROR] Test file not found: {test_file}")
        sys.exit(2)

    # 组装 pytest 参数
    # -q: 安静输出；去掉 -q 可查看详细日志；加 -vv 更详细
    # 你也可以追加 '-k' 只跑某些用例
    args = [str(test_file), "-q"]

    # 运行 pytest
    retcode = pytest.main(args)

    # 按 pytest 返回码退出
    sys.exit(retcode)


if __name__ == "__main__":
    main()