import { CurrentUser } from '../../generated/CurrentUser';
import { signinOrRefresh, loginCallback, checkLoggedIn, signOut, getUserManager } from './login';

const button = document.querySelector('button');
const callback = new URLSearchParams(window.location.search).get('callback');

const fetchMe = async (accessToken: string | undefined) => {
  const currentUserApi = new CurrentUser();
  const response = await currentUserApi.getCurrentUser(
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
  // could be if not using auto-generated client
  // const response = await fetch(`${apiUrl}/me`, {
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  // });

  // return response?.json();
}

if (callback === 'true') {
  // We are on login-callback
  loginCallback();
}
button?.addEventListener('click', async () => {
  const loggedIn = await checkLoggedIn();
  if(!loggedIn) {
    signinOrRefresh();
  } else {
    signOut();
  }
});
const statusEl = document.getElementById('status')
if(button && statusEl) {
  const loggedIn = await checkLoggedIn();
  if(loggedIn) {
    button.textContent = 'log out';
    
    const userManager = await getUserManager();
    const user = await userManager?.getUser();

    const info = await fetchMe(user?.access_token);
    console.log(info);
    statusEl.innerHTML = `You are logged in with <pre>
    token: ${user?.access_token?.substring(0, 20)}...
    email: ${user?.profile?.email}
    </pre>`;
  } else {
    button.textContent = 'log in'; 
    statusEl.textContent = 'You are not logged in';
  }
}