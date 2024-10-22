// 处理来自前端的请求
import {ipcMain} from "electron";
import axios from "axios";

export default createRequest;

function createRequest() {
    ipcMain.handle('request', async (event, args) => {
        const {path, data} = args
        try {
            // 这里应使用实际的NestJS服务器地址
            const response = await axios.get(`http://localhost:4000${path}`, {
                params: {
                    msg: data
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error calling NestJS demo endpoint:', error);
            throw error; // 将错误抛回给前端
        }
    });
}