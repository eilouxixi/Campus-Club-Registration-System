import pymysql
from config import settings

# 连接数据库
conn = pymysql.connect(
    host=settings.MYSQL_HOST,
    port=settings.MYSQL_PORT,
    user=settings.MYSQL_USER,
    password=settings.MYSQL_PASSWORD,
    database=settings.MYSQL_DATABASE,
    charset='utf8mb4'
)

cursor = conn.cursor()

# 添加缺失的字段
try:
    cursor.execute("ALTER TABLE registrations ADD COLUMN student_id VARCHAR(20) NOT NULL DEFAULT '' AFTER activity_id")
    print('添加 student_id 字段成功')
except Exception as e:
    print(f'提示: {e}')

try:
    cursor.execute("ALTER TABLE registrations ADD COLUMN class_name VARCHAR(100) NOT NULL DEFAULT '' AFTER student_id")
    print('添加 class_name 字段成功')
except Exception as e:
    print(f'提示: {e}')

try:
    cursor.execute("ALTER TABLE registrations ADD COLUMN contact VARCHAR(50) NOT NULL DEFAULT '' AFTER class_name")
    print('添加 contact 字段成功')
except Exception as e:
    print(f'提示: {e}')

conn.commit()
cursor.close()
conn.close()

print('\n数据库表结构更新完成！')
