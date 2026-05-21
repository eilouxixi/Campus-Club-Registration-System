import pymysql
from passlib.context import CryptContext
from config import settings

def test_login():
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    
    try:
        conn = pymysql.connect(
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            database=settings.MYSQL_DATABASE,
            charset='utf8mb4'
        )
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        email = '3012127489@qq.com'
        cursor.execute("SELECT id, email, hashed_password FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user:
            print(f"Found user: {user['email']}")
            print(f"Hashed password: {user['hashed_password']}")
            
            test_passwords = ['123456', 'password', 'admin123']
            for pwd in test_passwords:
                is_valid = pwd_context.verify(pwd, user['hashed_password'])
                print(f"Password '{pwd}' verification: {is_valid}")
        else:
            print(f"User with email {email} not found")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_login()
