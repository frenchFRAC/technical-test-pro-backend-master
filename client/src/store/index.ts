import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { slices } from './slices';

const reducers = slices.reduce((result, currentSlice) => {
  return {
    ...result,
    [currentSlice.name]: currentSlice.reducer,
  };
}, {});
const rootReducer = combineReducers(reducers);

export const store = configureStore({
  reducer: rootReducer,
});

// Inférer les types `RootState` et `AppDispatch` depuis le store lui-même
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; // Exporter AppDispatch
