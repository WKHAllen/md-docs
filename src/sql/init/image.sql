CREATE TABLE IF NOT EXISTS image (
  id          CHAR(16)        NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  data        VARCHAR(349525) NOT NULL,
  create_time TIMESTAMP       NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id)
);
