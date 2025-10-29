import {UserManager, WebStorageStateStore} from 'oidc-client-ts';
import clientConfig from '../../config';



export const getUserManager = async () => {
  const {clientId} = clientConfig;
  if (clientId) {
    const authority = 'https://sso.dev.intescia.com/realms/intescia';
    return new UserManager({
      authority,
				 
      client_id: clientId,
				 
      // client_secret: clientConfig.clientSecret,
      redirect_uri: clientConfig.redirectUri,
      userStore: new WebStorageStateStore({store: window.localStorage}),
      automaticSilentRenew: true,
    });
  }

  return undefined;
};

const findLocalItem = <T>(query: RegExp, force = false) => {
  let targetValue: T | undefined;
  if (typeof chrome === 'undefined' || !chrome?.runtime?.id || force) {
    try {
      // Use every to exit the loop when the target value is found
      for (const localStorageKey in localStorage) {
        if (localStorageKey?.match(query)) {
          const itemFromLocalStorage = localStorage.getItem(localStorageKey);
          if (itemFromLocalStorage) {
            targetValue = JSON.parse(itemFromLocalStorage) as T;
          }
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }
  return targetValue;
};

export const findLocalKey = (query: RegExp) => Object.keys(localStorage).find((localStorageKey) =>
  localStorageKey?.match(query)
);


const reSignin = async (userManager: UserManager | undefined) => {
  userManager?.removeUser();
  await signin(false, userManager);
}

const refreshToken = async (userManager: UserManager | undefined) => {
  try {
    await userManager?.signinSilent();
  } catch (error) {
    console.warn('Error while refreshing token', error);
    reSignin(userManager);
  }
}

const signin = async (fromLoginCallback: boolean, userManager: UserManager | undefined) => {
  if (userManager) {
    // If we are on login-callback,  we have to redirect without state
    if (!fromLoginCallback) {
      const { pathname, search } = window.location;
      await userManager.signinRedirect({
        state: { pathname, search },
      });
    } else {
      await userManager.signinRedirect();
    }
  }
};

export const checkLoggedIn = async () => {
  const userManager = await getUserManager();
  const user = await userManager?.getUser();
  return !!user && !user.expired;
};

export const signOut = async () => {
  const userManager = await getUserManager();
  if (userManager) {
    return userManager?.signoutRedirect({
      post_logout_redirect_uri: window.location.origin,
    });
  }
}


export const loginCallback = async () => {
  const userManager = await getUserManager();
  let user = await userManager?.getUser();
  await userManager?.removeUser();
  try {
    // Test if the old issuer is different from the new one, if it is the case, we remove the old user from localStorage to be sure to not have a conflict
    const authority = userManager?.settings?.authority;
    if (authority) {
      const oldUser = findLocalKey(/oidc.user/),
        issuerTester = new RegExp(authority);
      if (oldUser && !issuerTester.test(oldUser)) {
        localStorage.removeItem(oldUser);
      }
    }
    user = await userManager?.signinRedirectCallback();
    const s = user?.state as { pathname?: string; search?: string };
    let url = '/';
    if (s?.pathname) {
      url = s.pathname;
    }
    if (s?.search) {
      url += s.search;
    }
    window.location.href = url;
  } catch (error) {
    // Probably we come from login without user state
    console.warn(error);
    signin(true, userManager);
  }
      
}

export const signinOrRefresh = async () => {
  const userManager = await getUserManager();
  // Automatically re login when the access token is expired
  userManager?.events.removeAccessTokenExpired(() => reSignin(userManager));
  userManager?.events.addAccessTokenExpired(() => {
    reSignin(userManager);
  });
  // Get the current user
  let user = await userManager?.getUser();
  if (!user) {
    await signin(false, userManager);
  } else if (user.expired) {
    await refreshToken(userManager);
  }
  user = await userManager?.getUser();
  return user;
}


export const getAccessToken = () => {
  const accessTokenStorage =
      findLocalItem<{ access_token: string }>(/oidc.user/)?.access_token;
  return accessTokenStorage;
}