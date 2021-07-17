CREATE TABLE IF NOT EXISTS document (
  id                CHAR(16)       NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  creator_user_id   CHAR(16)       NOT NULL,
  group_id          CHAR(16)       NOT NULL,
  directory_id      CHAR(16),
  name              VARCHAR(255)   NOT NULL,
  content           VARCHAR(65535) NOT NULL,
  create_time       TIMESTAMP      NOT NULL DEFAULT NOW(),
  last_edit_time    TIMESTAMP,
  last_edit_user_id CHAR(16),

  PRIMARY KEY (id),

  CONSTRAINT fk_document_creator
    FOREIGN KEY (creator_user_id)
      REFERENCES app_user(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_document_group
    FOREIGN KEY (group_id)
      REFERENCES app_group(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_document_directory
    FOREIGN KEY (directory_id)
      REFERENCES directory(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_document_editor
    FOREIGN KEY (last_edit_user_id)
      REFERENCES app_user(id)
        ON DELETE SET NULL
);
