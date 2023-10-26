import { CRX_COMMAND, CRX_MSG_RECEIVER } from '@CrxConstants';
import { useEffect, useState } from 'react';
import './style.css'
import Signin from './components/Signin';
import { getSigninSwitch, setUser } from './ts/reducers/user';
import { useAppDispatch, useAppSelector } from './ts/hooks';
import Home from './components/Home';
import { CrxMessage } from './ts/interface/CrxInterface';
import { setIsPlaying } from './ts/reducers/process';
import { setSnackbarMessage } from './ts/reducers/dialog';

export default () => {
    const dispatch = useAppDispatch();
    chrome.runtime.onMessage.addListener((message: CrxMessage) => {
        if (message.receiver !== CRX_MSG_RECEIVER.REACT) return;
        switch (message.command) {
            case CRX_COMMAND.CMD_END_PROCESS : {
                dispatch(setIsPlaying(false));
                break;
            }
            case CRX_COMMAND.CMD_SET_SNACKBAR_MESSAGE : {
                dispatch(setSnackbarMessage(message.payload.message))
            }
        }
    });
    const [isSignin, setIsSignin] = useState(false);
   
    useEffect(() => {
        chrome.storage.local.get('user').then(result => {
            if (result.user) {
                dispatch(setUser(result.user));
                setIsSignin(true);
            }
            else setIsSignin(false);
        });
    }, []);

    if (isSignin) return <Home/>
    return <Signin/>
}