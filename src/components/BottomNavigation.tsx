import { AccountCircle, PlayArrow, RadioButtonChecked, Save, Stop, VideoCall } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/ts/hooks";
import { getIsPlaying, getIsRecording, getProcessId, setIsPlaying, setIsRecording } from "@/ts/reducers/process";
import { sendMessageToServiceWorker } from "@/ts/api/CrxApi";
import { CRX_COMMAND } from "@/ts/constants/CrxConstants";
import { setIsOpenRecorderURLDialog, setIsOpenSaveRecordsDialog } from "@/ts/reducers/dialog";

export default () => {
    const [value, setValue] = useState('recents');
    const dispatch = useAppDispatch();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const [isRecording, setIsRecordingFromStorage] = useState(false);
    useEffect(() => {
        chrome.storage.local.get('isRecording').then(result => {
            setIsRecordingFromStorage(result.isRecording);
        });
    });
    const isPlaying = useAppSelector(getIsPlaying);
    const processId = useAppSelector(getProcessId);
    const openRecorderModal = () => {
        dispatch(setIsOpenRecorderURLDialog(true));
    }
    const stopRecorder = () => {
        dispatch(setIsRecording(false));
        dispatch(setIsOpenSaveRecordsDialog(true));
    }
    const playerOnClick = (bool: boolean) => {
        dispatch(setIsPlaying(bool));
        if (bool) {
            sendMessageToServiceWorker(CRX_COMMAND.CMD_START_PROCESS, {id : processId});
        }
    }
    const recorderIcon = () => {
        if (isRecording) {
            return (
                <BottomNavigationAction
                onClick={stopRecorder}
                value='stopRecorder'
                icon={<Stop />}
                />
            )
        } else {
            return (
                <BottomNavigationAction
                onClick={openRecorderModal}
                value='startRecorder'
                {...(isPlaying && {disabled : true})}
                icon={<RadioButtonChecked />}
                />
            )
        }
    }
    const playIcon = () => {
        if (isPlaying) {
            return (
                <BottomNavigationAction
                    onClick={() => playerOnClick(false)}
                    icon={<Stop />}
                />
            )
        } else {
            return (
                <BottomNavigationAction
                onClick={() => playerOnClick(true)}
                    {...(isRecording && {disabled : true})}
                    icon={<PlayArrow />}
                />
            )
        }
    }
    return (
    <BottomNavigation
    sx={{  }}
    value={value}
    onChange={handleChange}
    >
        {recorderIcon()}
        {playIcon()}
        <BottomNavigationAction
        value="account"
        icon={<AccountCircle />}
        />
    </BottomNavigation>
    );
}