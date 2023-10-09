import { AccountCircle, PlayArrow, Save, VideoCall } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useState } from "react";

export default () => {
    const [value, setValue] = useState('recents');
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
    <BottomNavigation
    sx={{  }}
    value={value}
    onChange={handleChange}
    >
        <BottomNavigationAction
        label="Record"
        value="record"
        icon={<VideoCall />}
        />
        <BottomNavigationAction
        label="Play"
        value="play"
        icon={<PlayArrow />}
        />
        <BottomNavigationAction
        label="Account"
        value="account"
        icon={<AccountCircle />}
        />
    </BottomNavigation>
    );
}