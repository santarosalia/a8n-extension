import {Box, Button, Container, InputLabel, TextField} from '@mui/material';
import { sendMessageToServiceWorker } from '@CrxApi';
import { CRX_COMMAND } from '@CrxConstants';
import {axios, getAccessToken} from '@/ts/api/Axios'
import { useState, ChangeEvent, useEffect } from 'react';
import './style.css'
import BottomNavigation from './components/BottomNavigation';
import ProcessSelect from './components/ProcessSelect';
import Signin from './components/Signin';
import { store } from '@/ts/store'
import { getUser, setUser } from './ts/reducers/user';
import { useAppSelector } from './ts/hooks';

export default () => {
    const {user} = useAppSelector(getUser);
    console.log(user)
    const [isSignin, setIsSignin] = useState(false);
    const [process, setProcess] = useState(null);

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
    useEffect(() => {
        console.log(user)
        // user ? setIsSignin(true) : setIsSignin(false);
    });

    if (isSignin) {
        return (
            <>
            <Box>
                <Box width={'80%'} margin={'auto'}>
                    <ProcessSelect/>
                </Box>
                
                <Button onClick={() => {
                    store.dispatch(setUser(null))
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