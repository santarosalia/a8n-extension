import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
    accessToken: string,
    createdAt: string,
    email: string,
    emailVerified?: string,
    id: string,
    image?: string,
    level: number,
    name: string,
    updatedAt: string
}

const initialState: UserState = null;

export const userSlice = createSlice({
    name: "user",
    initialState,

    reducers: {
        setUser: (state, action) => {
            state = action.payload;
            chrome.storage.local.set({
                user : action.payload
            });
            console.log(state)
        },
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;