import { configureStore } from '@reduxjs/toolkit';

// Placeholder for auth slice
const authReducer = (state = { isAuthenticated: false, user: null }, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { isAuthenticated: true, user: action.payload };
        case 'LOGOUT':
            return { isAuthenticated: false, user: null };
        default:
            return state;
    }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
