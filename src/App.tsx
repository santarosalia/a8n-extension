import {Button, Container} from '@mui/material';
import { sendMessageToServiceWorker } from '@CrxApi';
import { CRX_COMMAND } from '@CrxConstants';
import Axios from 'axios';

export default () => {
    const ax = () => {
        Axios.post('https://www.lunatic.monster/api/signin',{
            email : 'a',
            password : 'a'
        }).then(result => {
            console.log(result);
        });
    }

    const onClick = () => {
        sendMessageToServiceWorker(CRX_COMMAND.CMD_LAUNCH_BROWSER_RECORDER, {
            url : 'https://naver.com'
        });
    }
    return (
        <>
        

            <Button onClick={ax}>index</Button>
        
        </>
    )
}