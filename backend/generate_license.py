# seed_license_mysql.py
import os
import sys
import hashlib
import random
import pymysql
from datetime import datetime, timedelta, timezone

CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

def gen_key():
    def part():
        return "".join(random.choice(CHARS) for _ in range(4))
    return f"{part()}-{part()}-{part()}-{part()}"

def normalize_key(raw: str) -> str:
    return raw.strip().upper()

def hash_license_key(raw: str) -> str:
    return hashlib.sha256(normalize_key(raw).encode("utf-8")).hexdigest()

def main():
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = int(os.getenv("DB_PORT", "3306"))
    user = os.getenv("DB_USER", "Usersadmin")
    pwd  = os.getenv("DB_PASS", "sKLJyDab7Kd46wzF")
    dbn  = os.getenv("DB_NAME", "Users")

    multi_use = os.getenv("LICENSE_MULTI_USE", "0") == "1"
    days_valid = int(os.getenv("LICENSE_DAYS", "365"))
    feature = os.getenv("LICENSE_FEATURE", "pro")

    raw = gen_key()
    kh = hash_license_key(raw)

    expires_at = (datetime.now(timezone.utc) + timedelta(days=days_valid)) if days_valid > 0 else None

    conn = pymysql.connect(host=host, port=port, user=user, password=pwd, database=dbn, charset="utf8mb4", autocommit=True)
    try:
        with conn.cursor() as cur:
            sql = """
            INSERT INTO license_keys (key_hash, is_multi_use, is_used, feature, expires_at, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            """
            cur.execute(sql, (kh, 1 if multi_use else 0, 0, feature, expires_at.strftime("%Y-%m-%d %H:%M:%S") if expires_at else None))
        print(f"SUCCESS: generated license key: {raw}")
        print(f"feature={feature}, multi_use={multi_use}, expires_at={expires_at}")
    except pymysql.err.IntegrityError as e:
        print(f"ERROR: duplicate key_hash or constraint violation: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()