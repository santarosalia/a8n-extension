import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface DialogState {
    isOpenRecorderURLDialog: boolean,
    isOpenSaveRecordsDialog: boolean,
    isOpenSnackbar: boolean,
    snackbarMessage: string
}

const initialState: DialogState = {
    isOpenRecorderURLDialog : false,
    isOpenSaveRecordsDialog : false,
    isOpenSnackbar : false,
    snackbarMessage : ''
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
        },
        setIsOpenSnackbar: (state, action) => {
            state.isOpenSnackbar = action.payload;
        },
        setSnackbarMessage: (state, action) => {
            state.snackbarMessage = action.payload;
            state.isOpenSnackbar = true;
        }
    },
});
const getters = {
    getSnackbarMessage: (state: RootState) => state.dialog.snackbarMessage
}

export const { setIsOpenRecorderURLDialog, setIsOpenSaveRecordsDialog, setIsOpenSnackbar, setSnackbarMessage } = dialogSlice.actions;
export const getIsOpenRecorderURLDialog = (state: RootState) => state.dialog.isOpenRecorderURLDialog;
export const getIsOpenSaveRecordsDialog = (state: RootState) => state.dialog.isOpenSaveRecordsDialog;
export const getIsOpenSnackbar = (state: RootState) => state.dialog.isOpenSnackbar;
export const { getSnackbarMessage } = getters;
export default dialogSlice.reducer;