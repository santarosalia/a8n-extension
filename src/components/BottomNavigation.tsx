import { AccountCircle, PlayArrow, RadioButtonChecked, Save, Stop, VideoCall } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/ts/hooks";
import { getIsPlaying, getIsRecording, setIsPlaying, setIsRecording } from "@/ts/reducers/process";

export default () => {
    const [value, setValue] = useState('recents');
    const dispatch = useAppDispatch();

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const isRecording = useAppSelector(getIsRecording);
    const isPlaying = useAppSelector(getIsPlaying);
    const recorderIcon = () => {
        if (isRecording) {
            return (
                <BottomNavigationAction
                onClick={() => dispatch(setIsRecording(false))}
                value="stopRecorder"
                icon={<Stop />}
                />
            )
        } else {
            return (
                <BottomNavigationAction
                onClick={() => dispatch(setIsRecording(true))}
                value="startRecorder"
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
                    onClick={() => dispatch(setIsPlaying(false))}
                    value="stopController"
                    icon={<Stop />}
                />
            )
        } else {
            return (
                <BottomNavigationAction
                onClick={() => dispatch(setIsPlaying(true))}
                    value="startController"
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