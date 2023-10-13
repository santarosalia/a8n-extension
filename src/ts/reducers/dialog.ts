import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface DialogState {
    isOpenRecorderURLDialog: boolean,
    isOpenSaveRecordsDialog: boolean
}

const initialState: DialogState = {
    isOpenRecorderURLDialog : false,
    isOpenSaveRecordsDialog : false
};

export const dialogSlice = createSlice({
    name: "dialog",
    initialState,

    reducers: {
        setIsOpenRecorderURLDialog: (state, action) => {
            state.isOpenRecorderURLDialog = action.payload;
        },
        setIsOpenSaveRecordsDialog : (state, action) => {
            state.isOpenSaveRecordsDialog = action.payload;
        }
    },
});

export const { setIsOpenRecorderURLDialog, setIsOpenSaveRecordsDialog } = dialogSlice.actions;
export const getIsOpenRecorderURLDialog = (state: RootState) => state.dialog.isOpenRecorderURLDialog;
export const getIsOpenSaveRecordsDialog = (state: RootState) => state.dialog.isOpenSaveRecordsDialog;
export default dialogSlice.reducer;