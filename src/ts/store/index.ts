import { configureStore } from "@reduxjs/toolkit";
import processReducer from '../reducers/process'
import userReducer from '../reducers/user';
import dialogReducer from '../reducers/dialog';
export const store = configureStore({
    reducer: {
        process : processReducer,
        user : userReducer,
        dialog : dialogReducer
    },
    devTools: import.meta.env.DEV
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;