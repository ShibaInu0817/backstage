# shared-auth

This library was generated with [Nx](https://nx.dev).


## Clerk
Goto https://optimal-cheetah-79.accounts.dev/user
console --> await window.Clerk.session.getToken().then(console.log)
copy the token to swagger


### To set up your Clerk dashboard for this multi-tenant system, follow these three essential steps:

#### 1. Enable Organizations (Tenants)
Clerk's "Organizations" feature maps directly to your "Tenants".

Go to Organization Settings in the sidebar.
Click "Enable Organizations".
(Optional) Under "Permissions", ensure you allow users to create and join organizations.

#### 2. Get Your API Keys
You need these for your .env file so the backend can verify tokens.

Go to Developers > API Keys.
Copy the Secret Key (sk_test_...) into your .env as CLERK_SECRET_KEY.
Copy the Publishable Key (pk_test_...) into your .env as CLERK_PUBLISHABLE_KEY.

#### 3. Configure the Session Token (JWT)
By default, Clerk separates organization data. To make it easy for your backend to find the tenantId, you can customize the JWT:

Go to JWT Templates in the sidebar.
Click on "Edit Session Token" (the default one).
Add the org_id claim to the JSON body:
json
{
  "org_id": "{{org.id}}"
}
Click Save.

#### 4. Verify Active Sessions
Ensure your test user has created or joined at least one organization.
When testing via the Account Portal or Console, ensure the organization is "active" (selected) so that the org_id claim is included in the token.

>[!TIP] Your ClerkAuthGuard is already updated to look for both session.org_id (custom template) and session.o.id (default Clerk structure), so it will work even if you skip step 3!