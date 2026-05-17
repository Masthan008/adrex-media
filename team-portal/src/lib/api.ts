import { API_URL } from './config';

const BASE = `${API_URL}/api`;

export const getHeaders = () => {
  const token = localStorage.getItem('adrex_token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      }).then(r => r.json()),
    logout: () =>
      fetch(`${BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }),
  },
  user: {
    getProfile: () =>
      fetch(`${BASE}/user/profile`, { headers: getHeaders() }).then(r => r.json()),
    updateProfile: (data: any) =>
      fetch(`${BASE}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then(r => r.json()),
  },
  tasks: {
    getMyTasks: () =>
      fetch(`${BASE}/tasks`, { headers: getHeaders() }).then(r => r.json()),
    updateStatus: (id: string, status: string) =>
      fetch(`${BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      }).then(r => r.json()),
  },
  messages: {
    getConversations: () =>
      fetch(`${BASE}/messages/conversations`, { headers: getHeaders() }).then(r => r.json()),
    getMessages: (userId: string) =>
      fetch(`${BASE}/messages/${userId}`, { headers: getHeaders() }).then(r => r.json()),
    send: (receiverId: string, content: string) =>
      fetch(`${BASE}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ receiverId, content }),
      }).then(r => r.json()),
    markRead: (id: string) =>
      fetch(`${BASE}/messages/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(r => r.json()),
  },
  team: {
    getMembers: () =>
      fetch(`${BASE}/team`, { headers: getHeaders() }).then(r => r.json()),
  },
  agency: {
    get: () =>
      fetch(`${BASE}/agency`, { headers: getHeaders() }).then(r => r.json()),
  },
  calendar: {
    get: () =>
      fetch(`${BASE}/calendar`, { headers: getHeaders() }).then(r => r.json()),
  },
};
