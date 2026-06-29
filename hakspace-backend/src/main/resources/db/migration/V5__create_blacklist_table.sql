CREATE TABLE IF NOT EXISTS blacklist (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    phone_number  VARCHAR(50) NOT NULL,
    email         VARCHAR(255),
    national_id   VARCHAR(100),
    reason        VARCHAR(1000) NOT NULL,
    blocked_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    blocked_by    VARCHAR(255),
    active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_blacklist_email ON blacklist(email);
CREATE INDEX IF NOT EXISTS idx_blacklist_active ON blacklist(active);
