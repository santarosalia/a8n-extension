import {Button, Container} from '@mui/material';
import { sendMessageToServiceWorker } from '@CrxApi';
import { CRX_COMMAND } from '@CrxConstants';
export default () => {
    const onClick = () => {
        sendMessageToServiceWorker(CRX_COMMAND.CMD_LAUNCH_BROWSER_RECORDER, {
            url : 'https://naver.com'
        });
    }
    return (
    <>
    <Button onClick={onClick}>d</Button>
    </>)
}