import { axios, getAccessToken } from "@/ts/api/Axios";
import { setUser } from "@/ts/reducers/user";
import { Box, Button, InputLabel, TextField } from "@mui/material"
import { useState, ChangeEvent } from 'react';
import { useAppDispatch } from "@/ts/hooks";
export default () => {
    const [inputs, setInputs] = useState({
        email : '',
        password : ''
    });
    const {email, password} = inputs;
    const dispatch = useAppDispatch();
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setInputs({
            ...inputs,
            [id] : value
        });
    }

    const signin = async () => {
        const result = await axios.post('/api/signin', inputs, {
            headers : {
                Authorization : await getAccessToken()
            }
        });
        dispatch(setUser(result.data));
    }
    return (
        <Box>
            <InputLabel htmlFor="email" size="normal">이메일</InputLabel>
            <TextField id="email" size="small" required value={email} type={"email"} onChange={onChange}></TextField>
            <InputLabel htmlFor="password">비밀번호</InputLabel>
            <TextField id="password" size="small" required value={password} type={"password"} onChange={onChange}></TextField>
            <Button onClick={signin}>로그인</Button>
        </Box>
    )
}