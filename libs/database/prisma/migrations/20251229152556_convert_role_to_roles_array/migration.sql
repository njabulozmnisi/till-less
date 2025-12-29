-- AlterTable: Convert single role to roles array
-- This migration preserves existing role data by converting it to an array

-- Step 1: Add new roles column as array with default [USER]
ALTER TABLE "users" ADD COLUMN "roles" "UserRole"[] DEFAULT ARRAY['USER']::"UserRole"[];

-- Step 2: Migrate existing role data to roles array
UPDATE "users" SET "roles" = ARRAY["role"]::"UserRole"[] WHERE "role" IS NOT NULL;

-- Step 3: Drop the old role column
ALTER TABLE "users" DROP COLUMN "role";
