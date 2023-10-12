import { AccountCircle, PlayArrow, RadioButtonChecked, Save, Stop, VideoCall } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { MouseEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/ts/hooks";
import { getIsPlaying, getIsRecording, getProcessId, setIsPlaying, setIsRecording } from "@/ts/reducers/process";
import { sendMessageToServiceWorker } from "@/ts/api/CrxApi";
import { CRX_COMMAND } from "@/ts/constants/CrxConstants";
import { setIsOpenRecorderURLDialog } from "@/ts/reducers/dialog";

export default () => {
    const [value, setValue] = useState('recents');
    const dispatch = useAppDispatch();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const isRecording = useAppSelector(getIsRecording);
    const isPlaying = useAppSelector(getIsPlaying);
    const processId = useAppSelector(getProcessId);
    const recorderOnClick = (e: MouseEvent) => {
        
        dispatch(setIsOpenRecorderURLDialog(true));
        console.log(1)
        // dispatch(setIsRecording(bool));
    }
    const playerOnClick = (bool: boolean) => {
        console.log(bool)
        dispatch(setIsPlaying(bool));
        console.log(processId);
        console.log(bool)
        if (bool) {
            sendMessageToServiceWorker(CRX_COMMAND.CMD_START_PROCESS, {id : processId})
        }
    }
    const recorderIcon = () => {
        if (isRecording) {
            return (
                <BottomNavigationAction
                onClick={recorderOnClick}
                value='stopRecorder'
                icon={<Stop />}
                />
            )
        } else {
            return (
                <BottomNavigationAction
                onClick={recorderOnClick}
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