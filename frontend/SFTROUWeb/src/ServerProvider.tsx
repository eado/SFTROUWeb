import { add } from './Serverconn';

export const startProcess = (callback: (data: any) => void, image: string, fileType: string, fileName: string, addErase: boolean) => {
    add({request: "startProcess", data: image, fileType, fileName, addErase}, callback)
}