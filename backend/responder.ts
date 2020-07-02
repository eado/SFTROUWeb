import WebSocket from 'ws';
import fs from 'fs';
import { exec } from 'child_process';

interface IData {
    [ key: string ]: () => void;
}

export default (message: any, ws: WebSocket) => {
    const send = (m: any) => {
        m.responseId = message.requestId
        ws.send(JSON.stringify(m))
    }
    const sendError = (errmsg: string) => send({error: errmsg})

    const functions: IData = {
        startProcess: () => {
            if (message.fileType == "xyz") {
                fs.writeFileSync(message.fileName + "input.xyz", message.data);
            } else {
                fs.writeFileSync(message.fileName + "input.png", Buffer.from(message.data, 'base64'));
            }

            const process = exec('java ../SisyphusForTheRestOfUs/src/v1/SFTROUCLI ' + message.fileName + 'input.' + message.fileType + " " + message.fileName + message.addErase ? "true" : "false");
            process.stdout?.on('data', (data) => {
                console.log(data)
                const chunks = (data as string).split("\n")
                chunks.forEach(chunk => send({data: chunk}))
            })

            process.on('error', (err) => {
                sendError(err.message)
            })

            process.on('close', (code, _) => {
                if (code == 0) {
                    try {
                        const thr = fs.readFileSync(message.fileName + ".thr").toString()
                        const image = fs.readFileSync(message.fileName + ".png").toString('base64')
                        send({thr, image})
                    } catch {
                        sendError("Could not convert image")
                    }

                } else {
                    sendError("Could not convert image")
                }
            })
        }
    }

    try {
        functions[message.request]()
    } catch (error) {
        sendError('nvf')
    }
}