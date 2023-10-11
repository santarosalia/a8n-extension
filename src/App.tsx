import {Box, Button } from '@mui/material';
import { sendMessageToServiceWorker } from '@CrxApi';
import { CRX_COMMAND } from '@CrxConstants';
import { useEffect, useState } from 'react';
import './style.css'
import BottomNavigation from './components/BottomNavigation';
import ProcessSelect from './components/ProcessSelect';
import Signin from './components/Signin';
import { getSigninSwitch, setUser } from './ts/reducers/user';
import { useAppDispatch, useAppSelector } from './ts/hooks';

export default () => {
    const [isSignin, setIsSignin] = useState(false);
    const [process, setProcess] = useState(null);
    const dispatch = useAppDispatch();
    const [processName, setProcessName] = useState('');

    
    // const getProcesses = async () => {
    //     const result = await axios.get(`/api/process/${user.id}`);
    //     setProcess(result.data);
    // }
    const startProcess = () => {
        
    }
   
    const recorderStart = () => {
        sendMessageToServiceWorker(CRX_COMMAND.CMD_LAUNCH_BROWSER_RECORDER, {
            url : 'https://naver.com'
        });
    }
    const recorderEnd = () => {
        sendMessageToServiceWorker(CRX_COMMAND.CMD_RECORDING_END, {
            name : processName
        });
    }
    const onClick = () => {
        sendMessageToServiceWorker(CRX_COMMAND.CMD_LAUNCH_BROWSER_RECORDER, {
            url : 'https://naver.com'
        });
    }
    const signinSwitch = useAppSelector(getSigninSwitch);
    useEffect(() => {
        chrome.storage.local.get('user').then(result => {
            if (result.user) setIsSignin(true);
            else setIsSignin(false);
        });
    }, [signinSwitch])
    if (isSignin) {
        return (
            <>
            <Box>
                <Box width={'80%'} margin={'auto'}>
                    <ProcessSelect/>
                </Box>
                
                <Button onClick={() => {
                    dispatch(setUser(null))
                }}>
                    logout
                </Button>
                <Box>
                    <Button onClick={startProcess}>start</Button>
                </Box>
            </Box>
            <BottomNavigation/>
            </>
        )
    }
    return (
        <Signin/>
    )
}