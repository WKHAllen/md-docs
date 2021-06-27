CREATE TABLE IF NOT EXISTS favorite_group (
  user_id           CHAR(16)  NOT NULL,
  favorite_group_id CHAR(16)  NOT NULL,
  favorite_time     TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_favorite_group_user
    FOREIGN KEY (user_id)
      REFERENCES app_user(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_favorite_group_group
    FOREIGN KEY (favorite_group_id)
      REFERENCES app_group(id)
        ON DELETE CASCADE
);
