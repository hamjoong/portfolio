-- DevCodeHub Initial Schema (PostgreSQL)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    login_id VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    contact VARCHAR(255),
    address VARCHAR(500),
    profile_image_url VARCHAR(255),
    avatar_url VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    credits INTEGER NOT NULL DEFAULT 500,
    total_spent_credits INTEGER NOT NULL DEFAULT 0,
    weekly_free_review_used INTEGER NOT NULL DEFAULT 0,
    max_weekly_free_limit INTEGER NOT NULL DEFAULT 5,
    provider VARCHAR(255),
    provider_id VARCHAR(255),
    social_access_token VARCHAR(1000),
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP
);

-- 2. Boards Table
CREATE TABLE IF NOT EXISTS boards (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 3. Board Tags
CREATE TABLE IF NOT EXISTS board_tags (
    board_id BIGINT NOT NULL REFERENCES boards(id),
    tag VARCHAR(255)
);

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES boards(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 5. Chat Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP
);

-- 6. Chat Room Users
CREATE TABLE IF NOT EXISTS chat_room_users (
    id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    last_read_at TIMESTAMP,
    last_read_message_id BIGINT
);

-- 7. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT NOT NULL REFERENCES chat_rooms(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP
);

-- 8. Senior Verification Requests
CREATE TABLE IF NOT EXISTS senior_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    blog_url VARCHAR(255),
    career_summary TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- 9. Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    target_id BIGINT,
    created_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_login_id ON users(login_id);
CREATE INDEX IF NOT EXISTS idx_board_type_created ON boards(type, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_room_msg_created ON chat_messages(chat_room_id, created_at);
