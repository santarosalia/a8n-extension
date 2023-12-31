import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface ProcessState {
    processId: string,
    isRecording: boolean,
    isPlaying: boolean,
    processes: {
        id: string,
        name: string
    }[]
}

const initialState: ProcessState = {
    processId: '',
    isRecording : false,
    isPlaying : false,
    processes : []
};

export const processSlice = createSlice({
    name: "process",
    initialState,

    reducers: {
        setProcessId: (state, action) => {
            state.processId = action.payload;
        },
        setIsRecording: (state, action) => {
            state.isRecording = action.payload;
            chrome.storage.local.set({isRecording : action.payload});
        },
        setIsPlaying: (state, action) => {
            state.isPlaying = action.payload;
            chrome.storage.local.set({isPlaying : action.payload});
        },
        setProcesses: (state, action) => {
            state.processes = action.payload;
        }
    },
});

export const { setProcessId, setIsRecording, setIsPlaying, setProcesses } = processSlice.actions;
// export const getIsRecording = (state: RootState) => state.process.isRecording;
export const getIsRecording = async () => await chrome.storage.local.get('isRecording');
export const getIsPlaying = (state: RootState) => state.process.isPlaying;
export const getProcessId = (state: RootState) => state.process.processId;
export const getProcesses = (state: RootState) => state.process.processes;
export default processSlice.reducer;