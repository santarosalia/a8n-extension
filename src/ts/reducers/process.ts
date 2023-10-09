import { createSlice } from "@reduxjs/toolkit";

export interface ProcessState {
    processId: string
}

const initialState: ProcessState = {
    processId: ''
};

export const processSlice = createSlice({
    name: "process",
    initialState,

    reducers: {
        setProcessId: (state, action) => {
            state.processId = action.payload;
        },
    },
});

export const { setProcessId } = processSlice.actions;
export default processSlice.reducer;