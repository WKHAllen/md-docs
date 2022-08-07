CREATE TABLE IF NOT EXISTS group_access (
  group_id          CHAR(16)  NOT NULL,
  user_id           CHAR(16)  NOT NULL,
  access_grant_time TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_group_access_group
    FOREIGN KEY (group_id)
      REFERENCES app_group(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_group_access_user
    FOREIGN KEY (user_id)
      REFERENCES app_user(id)
        ON DELETE CASCADE
);
