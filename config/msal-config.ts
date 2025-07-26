import { type Configuration, LogLevel } from "@azure/msal-browser"

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
  auth: {
    //
    // TODO: Replace with your app's client ID and authority.
    //
    clientId: "YOUR_CLIENT_ID", // e.g. "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // e.g. "https://login.microsoftonline.com/common"
    redirectUri: "/editor", // Must match the redirect URI in your App Registration
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            // console.info(message);
            return
          case LogLevel.Verbose:
            // console.debug(message);
            return
          case LogLevel.Warning:
            console.warn(message)
            return
        }
      },
    },
  },
}

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) for Microsoft Entra ID endpoints.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
  scopes: ["User.Read"],
}
