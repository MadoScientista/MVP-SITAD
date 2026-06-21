-- ============================================================
-- SITAD - Inicialización de Bases de Datos
-- ============================================================
-- Ejecutar este script desde MySQL Workbench:
--   Server → Data Import / Run SQL Script
-- o pegar directamente en una pestaña SQL y ejecutar.
-- ============================================================

CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS vehicular_db;
CREATE DATABASE IF NOT EXISTS fiscalizacion_db;

CREATE USER IF NOT EXISTS 'sitad'@'localhost' IDENTIFIED BY 'SitadDb2026!';

GRANT ALL PRIVILEGES ON auth_db.* TO 'sitad'@'localhost';
GRANT ALL PRIVILEGES ON vehicular_db.* TO 'sitad'@'localhost';
GRANT ALL PRIVILEGES ON fiscalizacion_db.* TO 'sitad'@'localhost';

FLUSH PRIVILEGES;
