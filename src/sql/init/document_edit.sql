CREATE TABLE IF NOT EXISTS document_edit (
  id                CHAR(16)       NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  document_id       CHAR(16)       NOT NULL,
  editor_user_id    CHAR(16)       NOT NULL,
  description       VARCHAR(255)   NOT NULL,
  new_content       VARCHAR(65535) NOT NULL,
  edit_request_time TIMESTAMP      NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),

  CONSTRAINT fk_edited_document
    FOREIGN KEY (document_id)
      REFERENCES document(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_document_editor
    FOREIGN KEY (editor_user_id)
      REFERENCES app_user(id)
        ON DELETE CASCADE
);
