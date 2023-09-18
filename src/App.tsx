import {Box, Button, Container, InputLabel, TextField} from '@mui/material';
import { sendMessageToServiceWorker } from '@CrxApi';
import { CRX_COMMAND } from '@CrxConstants';
import {axios, accessToken} from '@/ts/api/Axios'
import { useState, ChangeEvent, useEffect } from 'react';
import './style.css'

export default () => {
    const [user, setUser] = useState(null);

    const [inputs, setInputs] = useState({
        email : '',
        password : ''
    });
    const {email, password} = inputs;
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setInputs({
            ...inputs,
            [id] : value
        });
    }
    const getProcesses = async () => {
        const result = await axios.post('/api/process', {id : user.id}, {
            headers : {
                Authorization : await accessToken(),
            },
            params : {
                id : 1
            }
        });
        console.log(result)
    }
    const ax = async () => {
        const result = await axios.post('/api/signin', inputs, {
            headers : {
                Authorization : await accessToken()
            }
        });
        setUser(result.data);
        chrome.storage.local.set({
            user : result.data
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
                welcome {user.email}
                <Button onClick={getProcesses}>
                process
                </Button>
                <Button onClick={() => {
                    chrome.storage.local.set({
                        user : null
                    })
                }}>
                    logout
                </Button>
            </Box>
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