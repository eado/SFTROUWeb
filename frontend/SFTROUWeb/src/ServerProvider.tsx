import { add } from './Serverconn';

export const startProcess = (callback: (data: any) => void, image: string, fileType: string) => {
    add({request: "startProcess", data: image, fileType}, callback)
}