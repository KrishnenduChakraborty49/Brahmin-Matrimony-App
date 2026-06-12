import { configureStore } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
  isAuthenticated: !!token,
  token: token || null,
  user: user,
};

// Placeholder for auth slice
const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            return { isAuthenticated: true, token: action.payload.token, user: action.payload.user };
        case 'LOGOUT':
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { isAuthenticated: false, token: null, user: null };
        default:
            return state;
    }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
