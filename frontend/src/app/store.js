// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import gamesReducer from '../features/games/gamesSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import developersReducer from '../features/developers/developersSlice';
import authReducer from '../features/auth/authSlice';
import basketReducer from '../features/basket/basketSlice';

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    wishlist: wishlistReducer,
    developers: developersReducer,
    auth: authReducer,
    basket: basketReducer,
  },
});
