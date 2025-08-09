-- Add admin_fid column to vendors table to track who created/manages each vendor
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS admin_fid BIGINT;

-- Add foreign key constraint to link with users table
ALTER TABLE public.vendors 
ADD CONSTRAINT IF NOT EXISTS vendors_admin_fid_fkey 
FOREIGN KEY (admin_fid) REFERENCES public.users(fid) ON DELETE SET NULL;

-- Add index for better performance when querying vendors by admin
CREATE INDEX IF NOT EXISTS idx_vendors_admin_fid 
ON public.vendors USING btree (admin_fid);

-- Add comment to explain the column
COMMENT ON COLUMN public.vendors.admin_fid IS 'FID of the Farcaster user who created and manages this vendor';

-- Update existing vendors to set a default admin (optional - you can skip this if you want to handle it manually)
-- UPDATE public.vendors SET admin_fid = NULL WHERE admin_fid IS NULL;
