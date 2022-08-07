CREATE TABLE IF NOT EXISTS favorite_user (
  user_id          CHAR(16)  NOT NULL,
  favorite_user_id CHAR(16)  NOT NULL,
  favorite_time    TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_favorite_user
    FOREIGN KEY (user_id)
      REFERENCES app_user(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_favorite_user_user
    FOREIGN KEY (favorite_user_id)
      REFERENCES app_user(id)
        ON DELETE CASCADE
);
