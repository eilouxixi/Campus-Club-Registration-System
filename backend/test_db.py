import pymysql
from config import settings

def test_database():
    try:
        print("=" * 60)
        print("Testing database connection and user data")
        print("=" * 60)
        
        # Connect to MySQL database
        conn = pymysql.connect(
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            database=settings.MYSQL_DATABASE,
            charset='utf8mb4'
        )
        print(f"Successfully connected to MySQL database: {settings.MYSQL_DATABASE}")
        
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Query all users
        cursor.execute("SELECT id, email, student_id, role, created_at FROM users ORDER BY id DESC")
        users = cursor.fetchall()
        
        print(f"\nTotal {len(users)} users in database:")
        print("-" * 60)
        for user in users:
            print(f"ID: {user['id']}")
            print(f"  Email: {user['email']}")
            print(f"  Student ID: {user['student_id']}")
            print(f"  Role: {user['role']}")
            print(f"  Created at: {user['created_at']}")
            print("-" * 60)
        
        if len(users) == 0:
            print("\nHint: No users in database, please register a user first")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database()
