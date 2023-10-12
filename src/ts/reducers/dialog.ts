import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface DialogState {
    isOpenRecorderURLDialog: boolean
}

const initialState: DialogState = {
    isOpenRecorderURLDialog : false
};

export const dialogSlice = createSlice({
    name: "dialog",
    initialState,

    reducers: {
        setIsOpenRecorderURLDialog: (state, action) => {
            state.isOpenRecorderURLDialog = action.payload;
        },
    },
});

export const { setIsOpenRecorderURLDialog } = dialogSlice.actions;
export const getIsOpenRecorderURLDialog = (state: RootState) => state.dialog.isOpenRecorderURLDialog;
export default dialogSlice.reducer;