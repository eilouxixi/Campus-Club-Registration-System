import pymysql
from passlib.context import CryptContext
from config import settings

def reset_passwords():
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    new_password = "123456"
    
    try:
        conn = pymysql.connect(
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            database=settings.MYSQL_DATABASE,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        
        hashed_password = pwd_context.hash(new_password)
        
        cursor.execute("UPDATE users SET hashed_password = %s", (hashed_password,))
        conn.commit()
        
        print(f"已将所有用户的密码重置为: {new_password}")
        print(f"受影响的行数: {cursor.rowcount}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    reset_passwords()
