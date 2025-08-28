# Auth Service

This service provides authentication and team management for a multi-tenant SaaS application.

## Prerequisites

- Node.js
- npm
- A running Keycloak instance

## Installation

1.  Clone the repository.
2.  Navigate to the `auth-service` directory.
3.  Manually install the dependencies by running:
    ```bash
    npm install express axios dotenv cors express-jwt jwks-rsa
    npm install -D typescript @types/express @types/node ts-node-dev @types/cors
    ```
4.  Create a `.env` file in the root of the `auth-service` directory and add the following environment variables:

    ```
    KEYCLOAK_URL=http://localhost:8080
    KEYCLOAK_ADMIN_USER=admin
    KEYCLOAK_ADMIN_PASSWORD=admin
    ```

## Running the service

To run the service in development mode, run the following command:

```bash
npm start
```

The service will be available at `http://localhost:3000`.

## API Endpoints

See the code for details on the API endpoints. A Postman collection is available at `postman_collection.json`.

## Keycloak Configuration

Before you can use the service, you need to configure a few things in your Keycloak instance.

### 1. Create a Realm

Each application in your multi-tenant setup maps to a Keycloak realm.

1.  Go to your Keycloak Admin Console (usually at `http://localhost:8080/admin`).
2.  In the top-left corner, hover over the "master" realm and click "Add realm".
3.  Give your realm a name (e.g., `my-app`) and click "Create".

### 2. Create a Client

Your application needs a client to communicate with Keycloak for authentication.

1.  In your newly created realm, go to "Clients" in the left-hand menu.
2.  Click "Create".
3.  Set the "Client ID" to a value of your choice (e.g., `my-client`).
4.  Click "Save".

### 3. Configure the Client

1.  After creating the client, you will be taken to its settings page.
2.  Enable **Client authentication**. This is the equivalent of the older "Access Type: confidential" and is important for security as it requires the client to authenticate with a secret.
3.  Ensure that **Standard flow** is enabled in the "Authentication flow" settings.
4.  Enable **Direct access grants**. This will allow users to log in with their username and password directly from your service.
5.  Save the changes.
6.  A new "Credentials" tab will appear. Click on it to find your "Client Secret". You will need this for the `client_secret` in your API calls.

### 4. Create an Admin User (for Admin API access)

The service uses the Keycloak Admin REST API to manage users, groups, and roles. You need to provide admin credentials in the `.env` file. For production, it is recommended to create a dedicated admin user with limited permissions.

1.  Go to the "Users" section in the "master" realm.
2.  Create a new user.
3.  Go to the "Role Mappings" tab for that user.
4.  Assign the `admin` role from the `realm-management` client. This will give the user full control over all realms.
    *   **For better security:** Create a new role with only the necessary permissions (e.g., `manage-users`, `manage-clients`, `manage-realm`) and assign it to the user.

### 5. How Teams and Roles Work

*   **Teams** in this service are represented as **Keycloak Groups**. When you create a team, a group with the same name is created in Keycloak.
*   **Roles** are **Keycloak Client Roles**. When you create a team, a client role with the same name is also created.
*   When a user is added to a team, they are added to the corresponding group and assigned the corresponding role in Keycloak.