# Next.js WOPI Host Proof-of-Concept

This project is a scaffold for a Next.js application that acts as a [WOPI Protocol](https://learn.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/online/wopi-protocol-overview) host to integrate with Microsoft Word Online. It uses the Microsoft Authentication Library (MSAL) for React to handle user authentication against Microsoft Entra ID.

## Features

-   **MSAL Authentication**: Securely sign in users with their Microsoft accounts.
-   **WOPI Host APIs**: Implements essential WOPI endpoints (`CheckFileInfo`, `GetFile`, `PutFile`, locking) using Next.js API Routes.
-   **Embedded Word Editor**: Renders Word Online in an `iframe` on a protected route.
-   **Office Add-in**: Includes a basic task pane add-in to demonstrate document interaction.
-   **Bi-directional Communication**: Shows how the host page and the add-in can communicate using `postMessage`.

## Prerequisites

1.  **Node.js**: LTS version recommended.
2.  **Microsoft 365 Developer Tenant**: You can get a free one through the [Microsoft 365 Developer Program](https://developer.microsoft.com/en-us/microsoft-365/dev-program).
3.  **Microsoft Entra App Registration**: You need to register an application in your tenant.

## Setup Instructions

### 1. Register an Application in Microsoft Entra ID

1.  Go to the [Azure Portal](https://portal.azure.com) and navigate to **Microsoft Entra ID**.
2.  Go to **App registrations** and click **New registration**.
3.  Give it a name (e.g., "Next.js WOPI Host").
4.  For **Supported account types**, choose "Accounts in this organizational directory only" or another appropriate option.
5.  Under **Redirect URI**, select **Single-page application (SPA)** and enter `http://localhost:3000/editor`.
6.  Click **Register**.
7.  Copy the **Application (client) ID** and **Directory (tenant) ID**.

### 2. Configure the Project

1.  Clone this repository.
2.  Install dependencies: `npm install`.
3.  Open `config/msal-config.ts`.
4.  Replace `YOUR_CLIENT_ID` with your Application (client) ID.
5.  Replace `YOUR_TENANT_ID` with your Directory (tenant) ID.

### 3. Add a Sample Document

1.  Find or create a `.docx` file.
2.  Place it in the `/public` directory and name it `sample.docx`. The application is hardcoded to serve this file.

### 4. Trust the Self-Signed Certificate (for Add-in development)

For the Office Add-in to load correctly from `localhost` during development, you need to trust the Next.js development certificate.

1.  If you don't have the `office-addin-dev-certs` package, install it:
    \`\`\`bash
    npm install -g office-addin-dev-certs
    \`\`\`
2.  Install the certificate:
    \`\`\`bash
    office-addin-dev-certs install
    \`\`\`

### 5. Run the Application

Start the development server. Note that for the add-in to work, it must be served over HTTPS.

\`\`\`bash
npm run dev
\`\`\`

Your application will be running at `http://localhost:3000`.

## How It Works

1.  **Authentication**: You land on the homepage and click "Sign in with Microsoft". MSAL handles the popup login flow.
2.  **Editor Page**: After logging in, you are redirected to `/editor`. This page is protected by `AuthenticatedTemplate`.
3.  **WOPI Token Generation**: The editor page generates a short-lived JWT. This is the `access_token` for WOPI, **not** the MSAL token. It's used to authorize requests from Office Online to your WOPI API endpoints.
4.  **Iframe Rendering**: The editor page constructs the URL for the Word Online `iframe`, including your WOPI host's URL (`WOPISrc`) and the `access_token`.
5.  **WOPI Flow**:
    -   Word Online calls your `/api/wopi/files/[fileId]` endpoint (`CheckFileInfo`).
    -   Your API validates the `access_token` and returns metadata about the file, including its size, name, and your host's capabilities (e.g., it supports locking and add-ins).
    -   Word Online then calls `/api/wopi/files/[fileId]/contents` to get the document's binary content.
    -   As the user edits, Word Online manages locks by calling the `/lock` endpoint and sends back file updates via a `POST` request to the `/contents` endpoint.
6.  **Add-in and Communication**:
    -   The `CheckFileInfo` response tells Office to sideload the add-in from `/public/manifest.xml`.
    -   The add-in's task pane (`/public/taskpane/taskpane.html`) can use `Office.js` to interact with the document.
    -   The add-in can send messages to your editor page using `parent.postMessage`. The editor page listens for these and displays them.

## Further Reading

-   [Use the WOPI protocol to integrate with Microsoft 365 for the web](https://learn.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/online/?utm_source=chatgpt.com)
-   [React + MSAL integration examples](https://blog.openreplay.com/authentication-in-react-with-microsofts-msal-library/?utm_source=chatgpt.com)
