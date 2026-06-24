import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const fetchBoards = () => api.get('/boards');
export const fetchBoard = (id) => api.get(`/boards/${id}`);
export const createBoard = (data) => api.post('/boards', data);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);

export const createList = (boardId, data) => api.post(`/boards/${boardId}/lists`, data);
export const updateList = (boardId, listId, data) => api.put(`/boards/${boardId}/lists/${listId}`, data);
export const deleteList = (boardId, listId) => api.delete(`/boards/${boardId}/lists/${listId}`);

export const createCard = (listId, data) => api.post(`/lists/${listId}/cards`, data);
export const updateCard = (listId, cardId, data) => api.put(`/lists/${listId}/cards/${cardId}`, data);
export const deleteCard = (listId, cardId) => api.delete(`/lists/${listId}/cards/${cardId}`);
export const moveCard = (listId, cardId, newListId) =>
  api.post(`/lists/${listId}/cards/${cardId}/move`, { new_list_id: newListId });

export default api;
