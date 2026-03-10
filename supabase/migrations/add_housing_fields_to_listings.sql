ALTER TABLE listings ADD COLUMN IF NOT EXISTS bedrooms text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS bathrooms text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available_date date;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS neighborhood text;
