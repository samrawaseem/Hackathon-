from passlib.context import CryptContext
import sys

def test_argon2():
    try:
        pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
        h = pwd_context.hash("testpassword")
        print(f"Success: {h[:20]}...")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

if __name__ == "__main__":
    test_argon2()
