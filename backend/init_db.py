import pymysql
from pymysql import OperationalError

MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '@lcc070703',
    'charset': 'utf8mb4'
}

DATABASE_NAME = 'club_activity'

CREATE_TABLES_SQL = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
        email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
        student_id VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
        hashed_password VARCHAR(255) NOT NULL COMMENT '加密密码',
        role ENUM('student', 'admin') DEFAULT 'student' COMMENT '角色：student学生，admin社团管理员',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
    """,
    """
    CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '活动ID',
        title VARCHAR(200) NOT NULL COMMENT '活动标题',
        description TEXT COMMENT '活动详情描述',
        start_time DATETIME NOT NULL COMMENT '活动开始时间',
        end_time DATETIME NOT NULL COMMENT '活动结束时间',
        volunteer_count INT NOT NULL COMMENT '志愿者需求人数',
        max_participants INT NOT NULL COMMENT '最大参与人数',
        current_participants INT DEFAULT 0 COMMENT '当前报名人数',
        status ENUM('open', 'upcoming', 'ongoing', 'ended') DEFAULT 'upcoming' COMMENT '活动状态：open报名中, upcoming即将开始, ongoing进行中, ended已结束',
        created_by INT NOT NULL COMMENT '创建人ID',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';
    """,
    """
    CREATE TABLE IF NOT EXISTS activity_locations (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '活动地点ID',
        activity_id INT NOT NULL COMMENT '活动ID',
        location_name VARCHAR(100) NOT NULL COMMENT '地点名称',
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动地点表';
    """,
    """
    CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '报名ID',
        user_id INT NOT NULL COMMENT '用户ID',
        activity_id INT NOT NULL COMMENT '活动ID',
        student_id VARCHAR(20) NOT NULL COMMENT '学号',
        class_name VARCHAR(100) NOT NULL COMMENT '班级',
        contact VARCHAR(50) NOT NULL COMMENT '联系方式',
        status ENUM('registered', 'cancelled') DEFAULT 'registered' COMMENT '报名状态',
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
        cancelled_at DATETIME NULL COMMENT '取消报名时间',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        UNIQUE KEY uk_user_activity (user_id, activity_id, status) COMMENT '防止重复报名'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报名表';
    """
]

def check_and_migrate_activity_table(cursor, conn):
    cursor.execute("DESCRIBE activities")
    activity_columns = {col[0]: col[1] for col in cursor.fetchall()}

    migration_statements = []

    if 'location' in activity_columns:
        print("\n[!] 检测到 activities 表存在旧字段 'location'，需要迁移数据")
        print("=" * 60)
        print("请执行以下 ALTER TABLE 语句迁移数据：")
        print("-" * 60)
        print("ALTER TABLE activities ADD COLUMN location_name VARCHAR(100) AFTER description;")
        print("UPDATE activities SET location_name = location WHERE location IS NOT NULL;")
        print("ALTER TABLE activities DROP COLUMN location;")
        print("CREATE TABLE IF NOT EXISTS activity_locations (")
        print("    id INT AUTO_INCREMENT PRIMARY KEY,")
        print("    activity_id INT NOT NULL,")
        print("    location_name VARCHAR(100) NOT NULL,")
        print("    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE")
        print(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
        print("INSERT INTO activity_locations (activity_id, location_name)")
        print("SELECT id, location FROM activities WHERE location IS NOT NULL;")
        print("ALTER TABLE activities MODIFY COLUMN volunteer_count INT NOT NULL;")
        print("ALTER TABLE activities ADD COLUMN status ENUM('open','upcoming','ongoing','ended') DEFAULT 'upcoming' AFTER current_participants;")
        print("UPDATE activities SET status = 'open' WHERE status IS NULL;")
        print("=" * 60)
        print("[!] 建议：备份数据库后再执行上述迁移语句！")
        print()

    if 'volunteer_count' not in activity_columns:
        migration_statements.append("ALTER TABLE activities ADD COLUMN volunteer_count INT NOT NULL AFTER end_time;")
        print("\n[!] 检测到 activities 表缺少 'volunteer_count' 字段")

    if 'status' in activity_columns:
        existing_enum = activity_columns.get('status', '')
        if 'open' not in existing_enum:
            migration_statements.append("ALTER TABLE activities MODIFY COLUMN status ENUM('open','upcoming','ongoing','ended') DEFAULT 'upcoming';")
            print("\n[!] 检测到 activities 表 status 字段缺少 'open' 状态值")

    if migration_statements:
        print("\n自动执行的迁移语句：")
        for stmt in migration_statements:
            print(f"  - {stmt}")
            cursor.execute(stmt)
        conn.commit()
        print("迁移完成！")

def init_database():
    try:
        print("正在连接 MySQL 服务器...")
        conn = pymysql.connect(
            host=MYSQL_CONFIG['host'],
            port=MYSQL_CONFIG['port'],
            user=MYSQL_CONFIG['user'],
            password=MYSQL_CONFIG['password'],
            charset=MYSQL_CONFIG['charset']
        )
        cursor = conn.cursor()

        cursor.execute(f"SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{DATABASE_NAME}'")
        result = cursor.fetchone()

        if result:
            print(f"数据库 '{DATABASE_NAME}' 已存在")
        else:
            print(f"数据库 '{DATABASE_NAME}' 不存在，正在创建...")
            cursor.execute(f"CREATE DATABASE {DATABASE_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"数据库 '{DATABASE_NAME}' 创建成功")

        cursor.execute(f"USE {DATABASE_NAME}")

        cursor.execute("DESCRIBE users")
        existing_columns = [col[0] for col in cursor.fetchall()]

        if 'username' in existing_columns:
            cursor.execute("ALTER TABLE users DROP COLUMN username")
            print("已删除 users 表中的 username 列")

        if 'student_id' not in existing_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN student_id VARCHAR(20) DEFAULT NULL AFTER email")
            print("已添加 users 表中的 student_id 列（临时允许NULL）")

            cursor.execute("SELECT id, email FROM users WHERE student_id IS NULL OR student_id = ''")
            rows = cursor.fetchall()
            for row in rows:
                temp_student_id = f"TEMP_{row[0]}"
                cursor.execute("UPDATE users SET student_id = %s WHERE id = %s", (temp_student_id, row[0]))
            conn.commit()
            print(f"已为 {len(rows)} 条现有记录设置临时 student_id")

            cursor.execute("ALTER TABLE users MODIFY COLUMN student_id VARCHAR(20) NOT NULL UNIQUE")
            print("已将 student_id 改为 NOT NULL UNIQUE")

        cursor.execute("SHOW TABLES LIKE 'activities'")
        if cursor.fetchone():
            check_and_migrate_activity_table(cursor, conn)

        for sql in CREATE_TABLES_SQL:
            cursor.execute(sql)
        conn.commit()
        print("所有表创建/更新成功")

        cursor.close()
        conn.close()
        print("数据库初始化完成！")

    except OperationalError as e:
        print(f"MySQL 连接错误: {e}")
        print("请确保 MySQL 服务已启动，并且用户名密码正确")
        raise
    except Exception as e:
        print(f"初始化过程中发生错误: {e}")
        raise

if __name__ == "__main__":
    init_database()
