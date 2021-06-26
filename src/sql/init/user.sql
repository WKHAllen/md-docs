CREATE TABLE IF NOT EXISTS app_user (
  id        CHAR(16)     NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 16),
  username  VARCHAR(63)  NOT NULL,
  email     VARCHAR(63)  NOT NULL,
  password  VARCHAR(255) NOT NULL,
  image_id  CHAR(16),
  verified  BOOLEAN      NOT NULL DEFAULT FALSE,
  join_time TIMESTAMP    NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id)
);
