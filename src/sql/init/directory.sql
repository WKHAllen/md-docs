CREATE TABLE IF NOT EXISTS directory (
  id                  CHAR(16)     NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  name                VARCHAR(255) NOT NULL,
  group_id            CHAR(16)     NOT NULL,
  parent_directory_id CHAR(16),
  depth               INTEGER      NOT NULL DEFAULT 0,
  create_time         TIMESTAMP    NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),

  CONSTRAINT fk_directory_group
    FOREIGN KEY (group_id)
      REFERENCES app_group(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_directory_parent
    FOREIGN KEY (parent_directory_id)
      REFERENCES directory(id)
        ON DELETE CASCADE
);
