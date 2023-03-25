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
            let lastError = "Could not convert image"
            if (message.fileType == "xyz") {
                fs.writeFileSync("../SisyphusForTheRestOfUs/src/v1/" + message.fileName + "input.xyz", message.data);
            } else {
                fs.writeFileSync("../SisyphusForTheRestOfUs/src/v1/" + message.fileName + "input.png", Buffer.from(message.data, 'base64'));
                message.fileType = "png"
            }

            const processString = `cd ../SisyphusForTheRestOfUs/src && java -Xmx100m v1/SFTROUCLI v1/${message.fileName}input.${message.fileType} ${message.fileName} ${(message.addErase ? "true" : "false")}`
            const process = exec(processString);
            console.log(processString)
            process.stdout?.on('data', (data) => {
                console.log(data)
                const chunks = (data as string).split("\n")
                chunks.forEach(chunk => {
                    send({data: chunk})
                    if (chunk.startsWith("Error: ")) {
                        lastError = chunk
                        sendError(chunk)
                    }
                })
            })

            process.on('error', (err) => {
                sendError(err.message)
                lastError = err.message
		fs.unlinkSync(`../SisyphusForTheRestOfUs/src/v1/${message.fileName}input.${message.fileType}`)
            })

            process.on('close', (code, _) => {
                if (code == 0) {
                    try {
                        const thr = fs.readFileSync("../SisyphusForTheRestOfUs/src/" + message.fileName + ".thr").toString()
                        const image = fs.readFileSync("../SisyphusForTheRestOfUs/src/" + message.fileName + ".png").toString('base64')

                        fs.unlinkSync("../SisyphusForTheRestOfUs/src/" + message.fileName + ".thr")
                        fs.unlinkSync("../SisyphusForTheRestOfUs/src/" + message.fileName + ".png")
			fs.unlinkSync(`../SisyphusForTheRestOfUs/src/v1/${message.fileName}input.${message.fileType}`)
			send({thr, image})
                    } catch {
                        sendError(lastError)
			fs.unlinkSync(`../SisyphusForTheRestOfUs/src/v1/${message.fileName}input.${message.fileType}`)
                    }

                } else {
                    sendError(lastError)
   	            fs.unlinkSync(`../SisyphusForTheRestOfUs/src/v1/${message.fileName}input.${message.fileType}`)
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
