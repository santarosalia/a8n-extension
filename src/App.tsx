import { CRX_COMMAND, CRX_MSG_RECEIVER } from '@CrxConstants';
import { useEffect, useState } from 'react';
import './style.css'
import Signin from './components/Signin';
import { getIsSignin, setIsSignIn, setUser } from './ts/reducers/user';
import { useAppDispatch, useAppSelector } from './ts/hooks';
import Home from './components/Home';
import { CrxMessage } from './ts/interface/CrxInterface';
import { setIsPlaying } from './ts/reducers/process';
import { setSnackbarMessage } from './ts/reducers/dialog';
import { useCookies } from 'react-cookie';
import { getUser } from './ts/api/Axios';

export default () => {
    const dispatch = useAppDispatch();
    const [cookies, setCookie, removeCookie] = useCookies();
    chrome.runtime.onMessage.addListener((message: CrxMessage) => {
        if (message.receiver !== CRX_MSG_RECEIVER.REACT) return;
        switch (message.command) {
            case CRX_COMMAND.CMD_END_PROCESS : {
                dispatch(setIsPlaying(false));
                break;
            }
            case CRX_COMMAND.CMD_SET_SNACKBAR_MESSAGE : {
                dispatch(setSnackbarMessage(message.payload.message));
            }
        }
    });
    const isSignin = useAppSelector(getIsSignin);
   
    useEffect(() => {
        chrome.storage.local.get('SantaRosalia').then(result => {
            if (result.SantaRosalia) {
                setCookie('SantaRosalia', result.SantaRosalia, {
                    httpOnly : true
                });
                getUser().then(user => {
                    dispatch(setUser(user));
                    dispatch(setIsSignIn(true));
                });
            } else {
                removeCookie('SantaRosalia');
            }
        });
    }, [isSignin]);

    if (isSignin) return <Home/>
    return <Signin/>
}