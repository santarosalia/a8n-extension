import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface UserState {
    signinSwitch: boolean,
    user: {
        name: string,
        id: string,
        userId: string,
        level: number
    } | null
}

// const initialState: UserState = null;
const initialState: UserState = {
    signinSwitch : false,
    user : null
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.signinSwitch = !state.signinSwitch;
            chrome.storage.local.set({
                user : action.payload
            });
        },
    },
});

export const { setUser } = userSlice.actions;
export const getSigninSwitch = (state: RootState) => state.user.signinSwitch;
export const getUser = (state: RootState) => state.user.user;
export default userSlice.reducer;