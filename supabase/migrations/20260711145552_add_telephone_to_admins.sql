/*
# Add telephone column to admins table

## Changes
- Add `telephone` text column (nullable) to `admins` table for the admin login flow.
- No data loss, no type changes.
*/

ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS telephone text;
