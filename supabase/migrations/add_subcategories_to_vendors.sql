-- Add subcategories column to vendors table
-- This will store an array of subcategory IDs as JSON

ALTER TABLE vendors 
ADD COLUMN subcategories JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN vendors.subcategories IS 'Array of subcategory IDs selected by the vendor (e.g., ["tacos", "tortas", "quesadillas"])';

-- Create an index for better query performance on subcategories
CREATE INDEX idx_vendors_subcategories ON vendors USING GIN (subcategories);

-- Update existing vendors to have empty subcategories array
UPDATE vendors SET subcategories = '[]'::jsonb WHERE subcategories IS NULL;
