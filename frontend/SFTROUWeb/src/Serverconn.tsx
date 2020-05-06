const URL = "wss://sftrou.omarelamri.me:443"

let ws: WebSocket
const callbacks: [String, (data: any) => void][] = []
const caches: String[] = []

const openCallbacks = [() => {}]

function check() {
    if (!ws || ws.readyState === 3) {
        initialize()
    }
}

function initialize() {
    ws = new WebSocket(URL);

    ws.onmessage = (e) => {
        let data = JSON.parse(e.data);
        callbacks.forEach(
            callback => {
                if (data.responseId === callback[0]) {
                    callback[1](data);
                }
            }
        );
    }
    ws.onerror = (e) => {
        check()
    }

    ws.onclose = (e) => {
        check()
    }

    ws.onopen = (e) => {
        for (let callback of openCallbacks) {
            callback()
        }
        caches.forEach(element => {
            ws.send(element as string);
        });
    }
}

export function add(data: any, callback: ((any: any) => void)) {
    let identifier = uuidv4();
    data.requestId = identifier;
    callbacks.push([identifier, callback]);
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
    } else {
        caches.push(JSON.stringify(data));
    }
}

export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}

initialize()