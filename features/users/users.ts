import { CurrentUser } from '../../generated/CurrentUser';
import { UserFilter } from '../../generated/data-contracts';
import { signinOrRefresh } from '../login/login';

const searchUsersInCurrentOrganization = async (userFilter: UserFilter, query?: Parameters<CurrentUser['searchUsersInCurrentOrganization']>[1]) => {
  const user = await signinOrRefresh();
  const accessToken = user?.access_token;
  const currentUserApi = new CurrentUser();
  const response = await currentUserApi.searchUsersInCurrentOrganization(
    userFilter,
    query,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data;
  // could be if not using auto-generated client
  // const response = await fetch(`${apiUrl}/me/organization/users/search${query ? '?' : ''}${buildQueryParams(query as Record<string, string>)}`, {
  //   method: 'POST',
  //   body: JSON.stringify(
  //     userFilter
  //   ),
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  // });
  // return response?.json();
}

const usersContainer = document.getElementById('users-container');
if (usersContainer) {
  const usersResponse = await searchUsersInCurrentOrganization({});
  const users = usersResponse?._embedded?.currentOrganizationUserSearchResultModels || [];
  if (!users?.length) {
    usersContainer.textContent = 'No users found.';
  } else {
    const ul = document.createElement('ul');
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `user: ${user.email} - status: ${user.enabled ? 'enabled' : 'disabled'}`;
      ul.appendChild(li);
    });
    usersContainer.appendChild(ul);
  }
}
