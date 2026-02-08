-- Add receiveOrderEmails column to admin_users table
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS receive_order_emails BOOLEAN DEFAULT false;

-- Optional: Set existing super_admin users to receive emails by default
-- Uncomment the line below if you want existing admins to receive emails
-- UPDATE admin_users SET receive_order_emails = true WHERE role = 'super_admin';
