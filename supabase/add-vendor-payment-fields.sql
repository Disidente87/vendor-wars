-- Migration: Add payment and ownership fields to vendors table
-- Date: 2024-01-XX
-- Description: Adds fields required for the vendor registration payment system

-- Add payment and ownership fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS owner_address TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_amount TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS delegation TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_owner_address ON vendors(owner_address);
CREATE INDEX IF NOT EXISTS idx_vendors_payment_status ON vendors(payment_status);
CREATE INDEX IF NOT EXISTS idx_vendors_delegation ON vendors(delegation);

-- Update existing vendors to have default values for legacy data
UPDATE vendors SET 
  owner_address = '0x0000000000000000000000000000000000000000',
  payment_amount = '0',
  payment_status = 'legacy',
  delegation = 'general'
WHERE owner_address IS NULL;

-- Add constraints for data integrity
ALTER TABLE vendors ALTER COLUMN payment_status SET DEFAULT 'pending';
ALTER TABLE vendors ALTER COLUMN payment_amount SET DEFAULT '0';

-- Add check constraint for payment status values
ALTER TABLE vendors ADD CONSTRAINT check_payment_status 
  CHECK (payment_status IN ('pending', 'completed', 'failed', 'legacy'));

-- Add check constraint for payment amount format
ALTER TABLE vendors ADD CONSTRAINT check_payment_amount 
  CHECK (payment_amount ~ '^[0-9]+(\.[0-9]+)?$');

-- Create a function to update payment status
CREATE OR REPLACE FUNCTION update_vendor_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- Validate payment status transition
  IF OLD.payment_status = 'completed' AND NEW.payment_status != 'completed' THEN
    RAISE EXCEPTION 'Cannot change payment status from completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment status updates
DROP TRIGGER IF EXISTS trigger_update_vendor_payment_status ON vendors;
CREATE TRIGGER trigger_update_vendor_payment_status
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_payment_status();

-- Add comments for documentation
COMMENT ON COLUMN vendors.owner_address IS 'Ethereum address of the vendor owner';
COMMENT ON COLUMN vendors.payment_amount IS 'Amount of BATTLE tokens paid for registration';
COMMENT ON COLUMN vendors.payment_status IS 'Status of the registration payment (pending/completed/failed/legacy)';
COMMENT ON COLUMN vendors.delegation IS 'Delegation name for the vendor';

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'vendors' 
  AND column_name IN ('owner_address', 'payment_amount', 'payment_status', 'delegation')
ORDER BY column_name;
