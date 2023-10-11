import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface UserState {
    signinSwitch: boolean
}

// const initialState: UserState = null;
const initialState: UserState = {
    signinSwitch : false
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.signinSwitch = !state.signinSwitch;
            chrome.storage.local.set({
                user : action.payload
            });
        },
    },
});

export const { setUser } = userSlice.actions;
export const getSigninSwitch = (state: RootState) => state.user.signinSwitch;
export default userSlice.reducer;