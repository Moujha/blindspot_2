import { fetchUsers } from '../api/backend-api.js';

export async function renderUserList(containerId) {
  const container = document.getElementById(containerId);
  try {
    const users = await fetchUsers();

    // Render user list
    container.innerHTML = `
      <ul>
        ${users
          .map(
            (user) =>
              `<li>${user.spotify_id} (Collection Size: ${user.collectionSize})</li>`
          )
          .join('')}
      </ul>
    `;
  } catch (error) {
    container.innerHTML = '<p>Failed to load users.</p>';
  }
}
