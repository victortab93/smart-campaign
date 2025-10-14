-- SmartCampaign Seed Data
-- Insert initial data for the application

-- Insert roles
INSERT INTO roles (code, name, description) VALUES
('INDIVIDUAL', 'Individual User', 'Basic user with limited features'),
('OWNER', 'Organization Owner', 'Full access to organization'),
('ADMIN_ORG', 'Organization Admin', 'Administrative access within organization'),
('EDITOR', 'Editor', 'Can create and edit campaigns'),
('VIEWER', 'Viewer', 'Read-only access'),
('SUPER_ADMIN', 'Super Admin', 'System-wide administrative access'),
('ADMIN_GLOBAL', 'Global Admin', 'Global system administration'),
('SUPPORT', 'Support', 'Customer support access'),
('AUDITOR', 'Auditor', 'Audit and compliance access');

-- Insert permissions
INSERT INTO permissions (code, name, description) VALUES
('USER_MANAGE', 'Manage Users', 'Create, edit, and delete users'),
('SUBSCRIPTION_MANAGE', 'Manage Subscriptions', 'Manage user subscriptions and billing'),
('CAMPAIGN_MANAGE', 'Manage Campaigns', 'Create, edit, and send campaigns'),
('CONTACT_MANAGE', 'Manage Contacts', 'Manage contact lists and segments'),
('FEATURE_MANAGE', 'Manage Features', 'Configure feature access and limits'),
('CONFIGURE_SYSTEM', 'Configure System', 'System configuration and settings'),
('VIEW_METRICS', 'View Metrics', 'Access to analytics and reporting'),
('VIEW_AUDIT_LOGS', 'View Audit Logs', 'Access to audit and compliance logs'),
('SYSTEM_ADMIN', 'System Administration', 'Full system administration access');

-- Insert role-permission mappings
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'SUPER_ADMIN';

-- Admin Global gets most permissions except system admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'ADMIN_GLOBAL' AND p.code != 'SYSTEM_ADMIN';

-- Owner gets campaign and contact management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'OWNER' AND p.code IN ('CAMPAIGN_MANAGE', 'CONTACT_MANAGE', 'VIEW_METRICS');

-- Editor gets campaign management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'EDITOR' AND p.code IN ('CAMPAIGN_MANAGE', 'CONTACT_MANAGE', 'VIEW_METRICS');

-- Insert features
INSERT INTO features (code, name, description, type) VALUES
('MAX_CONTACTS', 'Maximum Contacts', 'Maximum number of contacts allowed', 'limit'),
('DRAG_EDITOR', 'Drag & Drop Editor', 'Access to drag and drop email editor', 'toggle'),
('CUSTOM_DOMAIN', 'Custom Domain', 'Use custom domain for email sending', 'toggle'),
('UNLIMITED_EMAILS', 'Unlimited Emails', 'Send unlimited emails per month', 'toggle'),
('ADVANCED_ANALYTICS', 'Advanced Analytics', 'Access to advanced analytics and reporting', 'toggle'),
('PRIORITY_SUPPORT', 'Priority Support', 'Priority customer support', 'toggle');

-- Insert plans
INSERT INTO plans (code, name, description, price_monthly, price_yearly, is_active) VALUES
('STARTER', 'Starter', 'Perfect for small businesses getting started', 29.99, 299.99, true),
('GROWTH', 'Growth', 'For growing businesses with advanced needs', 79.99, 799.99, true),
('AUTOMATE', 'Automate', 'For businesses that need automation and scale', 199.99, 1999.99, true);

-- Insert plan features
-- Starter plan features
INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, '1000'
FROM plans p, features f
WHERE p.code = 'STARTER' AND f.code = 'MAX_CONTACTS';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'STARTER' AND f.code = 'DRAG_EDITOR';

-- Growth plan features
INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, '10000'
FROM plans p, features f
WHERE p.code = 'GROWTH' AND f.code = 'MAX_CONTACTS';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'GROWTH' AND f.code = 'DRAG_EDITOR';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'GROWTH' AND f.code = 'ADVANCED_ANALYTICS';

-- Automate plan features
INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'unlimited'
FROM plans p, features f
WHERE p.code = 'AUTOMATE' AND f.code = 'MAX_CONTACTS';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'AUTOMATE' AND f.code = 'DRAG_EDITOR';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'AUTOMATE' AND f.code = 'CUSTOM_DOMAIN';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'AUTOMATE' AND f.code = 'UNLIMITED_EMAILS';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'AUTOMATE' AND f.code = 'ADVANCED_ANALYTICS';

INSERT INTO plan_features (plan_id, feature_id, value)
SELECT p.id, f.id, 'true'
FROM plans p, features f
WHERE p.code = 'AUTOMATE' AND f.code = 'PRIORITY_SUPPORT';

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('SMTP_HOST', 'smtp.gmail.com', 'SMTP server hostname'),
('SMTP_PORT', '587', 'SMTP server port'),
('APP_NAME', 'SmartCampaign', 'Application name'),
('APP_LOGO', '/logo.png', 'Application logo URL'),
('MAX_FILE_SIZE', '10485760', 'Maximum file upload size in bytes (10MB)'),
('SESSION_TIMEOUT', '3600', 'Session timeout in seconds'),
('PASSWORD_MIN_LENGTH', '6', 'Minimum password length'),
('EMAIL_VERIFICATION_REQUIRED', 'false', 'Whether email verification is required for new users');

-- Create a super admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role_in_org, is_active) VALUES
('admin@smartcampaign.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', 'Super Admin', 'SUPER_ADMIN', true);

-- Assign super admin role to the admin user
INSERT INTO user_roles (user_id, role_id, organization_id)
SELECT u.id, r.id, NULL
FROM users u, roles r
WHERE u.email = 'admin@smartcampaign.com' AND r.code = 'SUPER_ADMIN';

-- Insert some sample organizations
INSERT INTO organizations (name, tax_id, billing_email, owner_user_id, is_active) VALUES
('Acme Corp', '123456789', 'billing@acme.com', (SELECT id FROM users WHERE email = 'admin@smartcampaign.com'), true),
('TechStart Inc', '987654321', 'billing@techstart.com', (SELECT id FROM users WHERE email = 'admin@smartcampaign.com'), true);

-- Insert some sample users
INSERT INTO users (email, password_hash, name, role_in_org, is_active, organization_id) VALUES
('john@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', 'John Doe', 'OWNER', true, (SELECT id FROM organizations WHERE name = 'Acme Corp')),
('jane@acme.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', 'Jane Smith', 'EDITOR', true, (SELECT id FROM organizations WHERE name = 'Acme Corp')),
('bob@techstart.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', 'Bob Johnson', 'OWNER', true, (SELECT id FROM organizations WHERE name = 'TechStart Inc'));

-- Assign roles to sample users
INSERT INTO user_roles (user_id, role_id, organization_id)
SELECT u.id, r.id, u.organization_id
FROM users u, roles r
WHERE u.email = 'john@acme.com' AND r.code = 'OWNER';

INSERT INTO user_roles (user_id, role_id, organization_id)
SELECT u.id, r.id, u.organization_id
FROM users u, roles r
WHERE u.email = 'jane@acme.com' AND r.code = 'EDITOR';

INSERT INTO user_roles (user_id, role_id, organization_id)
SELECT u.id, r.id, u.organization_id
FROM users u, roles r
WHERE u.email = 'bob@techstart.com' AND r.code = 'OWNER';

-- Insert some sample contacts
INSERT INTO contacts (user_id, organization_id, first_name, last_name, email, phone) VALUES
((SELECT id FROM users WHERE email = 'john@acme.com'), (SELECT id FROM organizations WHERE name = 'Acme Corp'), 'Alice', 'Brown', 'alice@example.com', '+1234567890'),
((SELECT id FROM users WHERE email = 'john@acme.com'), (SELECT id FROM organizations WHERE name = 'Acme Corp'), 'Charlie', 'Wilson', 'charlie@example.com', '+1234567891'),
((SELECT id FROM users WHERE email = 'bob@techstart.com'), (SELECT id FROM organizations WHERE name = 'TechStart Inc'), 'David', 'Lee', 'david@example.com', '+1234567892');

-- Insert some sample contact tags
INSERT INTO contact_tags (contact_id, tag) VALUES
((SELECT id FROM contacts WHERE email = 'alice@example.com'), 'VIP'),
((SELECT id FROM contacts WHERE email = 'alice@example.com'), 'Newsletter'),
((SELECT id FROM contacts WHERE email = 'charlie@example.com'), 'Newsletter'),
((SELECT id FROM contacts WHERE email = 'david@example.com'), 'Prospect');

-- Insert some sample subscriptions
INSERT INTO subscriptions (user_id, organization_id, plan_id, status, start_date, end_date, auto_renew)
SELECT u.id, NULL, p.id, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month', true
FROM users u, plans p
WHERE u.email = 'john@acme.com' AND p.code = 'GROWTH';

INSERT INTO subscriptions (user_id, organization_id, plan_id, status, start_date, end_date, auto_renew)
SELECT u.id, NULL, p.id, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month', true
FROM users u, plans p
WHERE u.email = 'bob@techstart.com' AND p.code = 'AUTOMATE';

-- Insert some sample campaigns
INSERT INTO campaigns (subscription_id, user_id, organization_id, name, status, send_date)
SELECT s.id, u.id, u.organization_id, 'Welcome Campaign', 'SENT', CURRENT_TIMESTAMP
FROM subscriptions s, users u
WHERE u.email = 'john@acme.com' AND s.user_id = u.id;

INSERT INTO campaigns (subscription_id, user_id, organization_id, name, status, send_date)
SELECT s.id, u.id, u.organization_id, 'Product Launch', 'DRAFT', NULL
FROM subscriptions s, users u
WHERE u.email = 'bob@techstart.com' AND s.user_id = u.id;

-- Insert campaign content
INSERT INTO campaign_content (campaign_id, subject, body_html, body_text, template_code)
SELECT c.id, 'Welcome to our newsletter!', '<h1>Welcome!</h1><p>Thank you for subscribing.</p>', 'Welcome! Thank you for subscribing.', 'welcome'
FROM campaigns c, users u
WHERE u.email = 'john@acme.com' AND c.user_id = u.id;

-- Insert campaign recipients
INSERT INTO campaign_recipients (campaign_id, contact_id, status, opened_at, clicked_at)
SELECT c.id, ct.id, 'SENT', CURRENT_TIMESTAMP, NULL
FROM campaigns c, contacts ct, users u
WHERE u.email = 'john@acme.com' AND c.user_id = u.id AND ct.organization_id = u.organization_id;

-- Insert campaign metrics
INSERT INTO campaign_metrics (campaign_id, total_sent, total_opened, total_clicked, total_bounced, total_unsubscribed)
SELECT c.id, 2, 1, 0, 0, 0
FROM campaigns c, users u
WHERE u.email = 'john@acme.com' AND c.user_id = u.id;

-- Insert some audit logs
INSERT INTO audit_logs (actor_user_id, organization_id, entity_type, entity_id, action, description, ip_address, user_agent)
SELECT u.id, u.organization_id, 'USER', u.id, 'CREATE', 'User account created', '127.0.0.1', 'Mozilla/5.0'
FROM users u
WHERE u.email IN ('john@acme.com', 'jane@acme.com', 'bob@techstart.com');

-- Insert admin metrics for today
INSERT INTO admin_metrics (date, total_users, active_users, total_campaigns, campaigns_sent, campaigns_pending, total_emails_sent, deliverability_rate)
VALUES (CURRENT_DATE, 4, 4, 2, 1, 1, 2, 95.2);

