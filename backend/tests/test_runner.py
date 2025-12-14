import os
import sys
from pathlib import Path

import pytest


def main():
    os.environ.setdefault("BASE_URL", "http://8.217.112.161:8000")
    file_name = "tests/test_auth_task.py"

    test_file = Path(file_name).resolve()
    if not test_file.exists():
        print(f"[ERROR] Test file not found: {test_file}")
        sys.exit(2)

    args = [str(test_file), "-q"]

    retcode = pytest.main(args)

    sys.exit(retcode)


if __name__ == "__main__":
    main()