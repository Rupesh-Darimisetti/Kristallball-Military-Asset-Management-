-- Military Asset Management System Schema
-- Generated from Prisma schema for submission

CREATE TYPE "Role" AS ENUM ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');
CREATE TYPE "EquipmentCategory" AS ENUM ('WEAPON', 'VEHICLE', 'AMMUNITION');
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'COMPLETED');
CREATE TYPE "AuditAction" AS ENUM ('PURCHASE', 'TRANSFER', 'ASSIGNMENT', 'EXPENDITURE', 'LOGIN');

CREATE TABLE bases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role "Role" NOT NULL,
  base_id INT REFERENCES bases(id) ON DELETE SET NULL
);
CREATE INDEX users_base_id_idx ON users(base_id);

CREATE TABLE equipment_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category "EquipmentCategory" NOT NULL
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX purchases_base_id_idx ON purchases(base_id);
CREATE INDEX purchases_equipment_type_id_idx ON purchases(equipment_type_id);
CREATE INDEX purchases_created_at_idx ON purchases(created_at);

CREATE TABLE transfers (
  id SERIAL PRIMARY KEY,
  source_base_id INT NOT NULL REFERENCES bases(id),
  destination_base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  status "TransferStatus" DEFAULT 'COMPLETED',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  initiated_by INT NOT NULL REFERENCES users(id)
);
CREATE INDEX transfers_source_base_id_idx ON transfers(source_base_id);
CREATE INDEX transfers_destination_base_id_idx ON transfers(destination_base_id);
CREATE INDEX transfers_equipment_type_id_idx ON transfers(equipment_type_id);
CREATE INDEX transfers_timestamp_idx ON transfers(timestamp);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  personnel_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX assignments_base_id_idx ON assignments(base_id);
CREATE INDEX assignments_equipment_type_id_idx ON assignments(equipment_type_id);

CREATE TABLE expenditures (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL,
  reason VARCHAR(255),
  expended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX expenditures_base_id_idx ON expenditures(base_id);
CREATE INDEX expenditures_equipment_type_id_idx ON expenditures(equipment_type_id);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  action "AuditAction" NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);
