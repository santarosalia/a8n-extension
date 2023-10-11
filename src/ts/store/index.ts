import { configureStore } from "@reduxjs/toolkit";
import processReducer from '../reducers/process'
import userReducer from '../reducers/user';
export const store = configureStore({
    reducer: {
        process : processReducer,
        user : userReducer
    },
    devTools: import.meta.env.DEV
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;