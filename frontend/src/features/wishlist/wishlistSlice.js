// src/features/wishlist/wishlistSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_WISHLIST_URL = 'http://localhost:5004/api/Wishlists';
const API_GAME_WISHLISTS_URL = 'http://localhost:5004/api/GameWishlists';


export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (customerId, { rejectWithValue }) => {
  try {
    const wishlistIdResp = await axios.get(`${API_WISHLIST_URL}/Customer/${customerId}/WishlistId`);
    const wishlistId = wishlistIdResp.data;
    const response = await axios.get(`${API_GAME_WISHLISTS_URL}/Wishlist/${wishlistId}`);
    console.log("Fetched wishlist data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching wishlist with games:", error);
    return rejectWithValue(error.response.data);
  }
});

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ customerId, gameId }, { rejectWithValue }) => {
    try {
      // Fetch the WishlistId associated with the customerId from the backend
      const wishlistIdResponse = await axios.get(`${API_WISHLIST_URL}/Customer/${customerId}/WishlistId`);
      const wishlistId = wishlistIdResponse.data;

      console.log('Fetched WishlistId:', wishlistId); // Log the fetched WishlistId

      // Send the request with the correct WishlistId
      const { data } = await axios.post(`${API_GAME_WISHLISTS_URL}`, { WishlistId: wishlistId, GameId: gameId });

      console.log('Added game to wishlist:', data); // Log the response from adding the game to the wishlist

      return data;
    } catch (error) {
      console.error("Failed to add to wishlist:", error.response);
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', async (gameWishlistId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_GAME_WISHLISTS_URL}/${gameWishlistId}`);
    return gameWishlistId; // Return ID to remove from state
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const clearWishlist = createAsyncThunk('wishlist/clearWishlist', async (customerId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_GAME_WISHLISTS_URL}/Clear/${customerId}`);
    return customerId; // Use customerId to confirm clearing in the state update
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.gameWishlistId !== action.payload);
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = []; // Clears the wishlist
      });
  }
});

export default wishlistSlice.reducer;