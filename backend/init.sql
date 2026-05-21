CREATE DATABASE IF NOT EXISTS club_activity DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE club_activity;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    hashed_password VARCHAR(255) NOT NULL COMMENT '加密密码',
    role ENUM('student', 'admin') DEFAULT 'student' COMMENT '角色：student学生，admin社团管理员',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '活动ID',
    title VARCHAR(200) NOT NULL COMMENT '活动标题',
    description TEXT COMMENT '活动详情描述',
    location VARCHAR(100) COMMENT '活动地点',
    start_time DATETIME NOT NULL COMMENT '活动开始时间',
    end_time DATETIME NOT NULL COMMENT '活动结束时间',
    max_participants INT NOT NULL COMMENT '最大参与人数',
    current_participants INT DEFAULT 0 COMMENT '当前报名人数',
    status ENUM('upcoming', 'ongoing', 'ended') DEFAULT 'upcoming' COMMENT '活动状态：upcoming即将开始, ongoing进行中, ended已结束',
    created_by INT NOT NULL COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动表';

CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '报名ID',
    user_id INT NOT NULL COMMENT '用户ID',
    activity_id INT NOT NULL COMMENT '活动ID',
    status ENUM('registered', 'cancelled') DEFAULT 'registered' COMMENT '报名状态',
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    cancelled_at DATETIME NULL COMMENT '取消报名时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_activity (user_id, activity_id, status) COMMENT '防止重复报名'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报名表';
