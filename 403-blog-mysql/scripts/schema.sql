
CREATE DATABASE IF NOT EXISTS blog 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE blog;

CREATE TABLE IF NOT EXISTS post (
   title VARCHAR(400) NOT NULL PRIMARY KEY,
   content TEXT,
   created VARCHAR(30),
   modified VARCHAR(30)
);

