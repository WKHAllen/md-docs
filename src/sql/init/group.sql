CREATE TABLE IF NOT EXISTS app_group (
  id                           CHAR(16)      NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  creator_user_id              CHAR(16),
  owner_user_id                CHAR(16)      NOT NULL,
  name                         VARCHAR(255)  NOT NULL,
  description                  VARCHAR(1023) NOT NULL,
  details_visible              BOOLEAN       NOT NULL DEFAULT FALSE,
  searchable                   BOOLEAN       NOT NULL DEFAULT FALSE,
  edit_documents_permission_id VARCHAR(63)   NOT NULL,
  approve_edits_permission_id  VARCHAR(63)   NOT NULL,
  image_id                     CHAR(16),
  create_time                  TIMESTAMP     NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),

  CONSTRAINT fk_group_creator
    FOREIGN KEY (creator_user_id)
      REFERENCES app_user(id)
        ON DELETE SET NULL,

  CONSTRAINT fk_group_owner
    FOREIGN KEY (owner_user_id)
      REFERENCES app_user(id)
        ON DELETE CASCADE,

  CONSTRAINT fk_edit_documents_permission
    FOREIGN KEY (edit_documents_permission_id)
      REFERENCES permission(id),

  CONSTRAINT fk_approve_edits_permission
    FOREIGN KEY (approve_edits_permission_id)
      REFERENCES permission(id),

  CONSTRAINT fk_group_image
    FOREIGN KEY (image_id)
      REFERENCES image(id)
        ON DELETE CASCADE
);
