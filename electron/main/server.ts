import {join} from "path";
import { fork} from 'child_process';
function createServer() {
    const serverPath = join(__dirname, '..', '..', 'server', 'main.js');
    fork(serverPath);
}

export default createServer;