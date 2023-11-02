import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface UserState {
    isSignin: false,
    user: {
        name: string,
        id: string,
        userId: string,
        level: number
    } | null
}

// const initialState: UserState = null;
const initialState: UserState = {
    isSignin : false,
    user : null
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setIsSignIn: (state, action) => {
          state.isSignin = action.payload;  
        },
        setUser: (state, action) => {
            state.user = action.payload;
            chrome.storage.local.set({
                user : action.payload
            });
        },
    },
});

export const { setUser, setIsSignIn } = userSlice.actions;
export const getIsSignin = (state: RootState) => state.user.isSignin;
export const getUser = (state: RootState) => state.user.user;
export default userSlice.reducer;