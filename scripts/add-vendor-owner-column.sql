-- Add owner_fid column to vendors table to track who created/manages each vendor
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS owner_fid BIGINT;

-- Add foreign key constraint to link with users table
ALTER TABLE public.vendors 
ADD CONSTRAINT IF NOT EXISTS vendors_owner_fid_fkey 
FOREIGN KEY (owner_fid) REFERENCES public.users(fid) ON DELETE SET NULL;

-- Add index for better performance when querying vendors by admin
CREATE INDEX IF NOT EXISTS idx_vendors_owner_fid 
ON public.vendors USING btree (owner_fid);

-- Add comment to explain the column
COMMENT ON COLUMN public.vendors.owner_fid IS 'FID of the Farcaster user who created and manages this vendor';

-- Update existing vendors to set a default admin (optional - you can skip this if you want to handle it manually)
-- UPDATE public.vendors SET owner_fid = NULL WHERE owner_fid IS NULL;
