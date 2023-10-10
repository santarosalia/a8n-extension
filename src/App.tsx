import {Box, Button, Container, InputLabel, TextField} from '@mui/material';
import { sendMessageToServiceWorker } from '@CrxApi';
import { CRX_COMMAND } from '@CrxConstants';
import {axios, getAccessToken} from '@/ts/api/Axios'
import { useState, ChangeEvent, useEffect } from 'react';
import './style.css'
import BottomNavigation from './components/BottomNavigation';
import ProcessSelect from './components/ProcessSelect';

export default () => {
    const [user, setUser] = useState(null);
    const [process, setProcess] = useState(null);
    const [inputs, setInputs] = useState({
        email : '',
        password : ''
    });
    const [processName, setProcessName] = useState('');
    const {email, password} = inputs;
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setInputs({
            ...inputs,
            [id] : value
        });
    }
    const getProcesses = async () => {
        const result = await axios.get(`/api/process/${user.id}`);
        setProcess(result.data);
    }
    const startProcess = () => {
        
    }
    const ax = async () => {
        const result = await axios.post('/api/signin', inputs, {
            headers : {
                Authorization : await getAccessToken()
            }
        });
        setUser(result.data);
        chrome.storage.local.set({
            user : result.data
        });
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
        chrome.storage.local.get('user').then(result => {
            setUser(result.user);
        });
    });
    if (user) {
        return (
            <>
            <Box>
                <Box width={'80%'} margin={'auto'}>
                    <ProcessSelect/>
                </Box>

                <Button onClick={() => {
                    chrome.storage.local.set({
                        user : null
                    })
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
        <>
        <Box>
            <InputLabel htmlFor="email" size="normal">이메일</InputLabel>
            <TextField id="email" size="small" required value={email} type={"email"} onChange={onChange}></TextField>
            <InputLabel htmlFor="password">비밀번호</InputLabel>
            <TextField id="password" size="small" required value={password} type={"password"} onChange={onChange}></TextField>
            <Button onClick={ax}>SignIn</Button>
        </Box>
        </>
    )
}