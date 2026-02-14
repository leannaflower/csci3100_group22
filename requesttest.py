import requests

BASE_URL = "http://8.217.112.161:8000/"

def test_login(username, password):
    url = f"{BASE_URL}/auth/login"
    data = {"username": username, "password": password}
    # 发送 POST 请求
    response = requests.post(url, json=data)
    # 打印响应信息
    print(f"状态码：{response.status_code}")
    print(f"响应内容：{response.json()}")
    return response
def test_register(username,password):
    url = f"{BASE_URL}/auth/register"
    data = {"username": username, "password": password}
    response = requests.post(url, json=data)
    print(f"状态码：{response.status_code}")
    print(f"响应内容：{response.json()}")
if __name__ == "__main__":
    print("测试正确登录：")
    test_login("test", "testpwd")

# 测试用例 2：错误的密码
    print("\n测试错误密码：")
    test_login("test", "wrongpassword")

# 测试用例 3：不存在的用户
    print("\n测试不存在的用户：")
    test_login("nonexistent", "anypassword")
    print("测试正确注册：")
    test_register("test1", "password")
    print("测试正确登录：")
    test_login("test1", "password")
    print("测试已注册的用户")
    test_register("test", "testpwd")