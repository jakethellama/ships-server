import WebSocket from 'ws';

// @ts-ignore
export function setCustomInterval(fn, ms: number): number {
    const on = [true];
    intervals.set(intervalId, on);
    intervalId += 1;
    customLoop(Date.now() + ms, fn, ms, on);
    return intervalId - 1;
}

export function clearCustomInterval(id: number): void {
    intervals.get(id)![0] = false;
    intervals.delete(id);
}

const intervals = new Map<number, boolean[]>();
let intervalId = 0;

// @ts-ignore
function customLoop(next: number, fn, ms: number, on: boolean[]) {
    if (on[0]) {
        setTimeout(() => {
            fn();
            customLoop(next + ms, fn, ms, on);
        }, next - Date.now());
    }
}

export const sendWithLatency = (ws: WebSocket, type: string, payload: object): void => {
    setTimeout(() => {
        ws.send(JSON.stringify({ type, payload }));
    }, 100 / 2);
};

export const closeEnough = function (x: number, y: number): boolean {
    return Math.abs(x - y) < 0.01;
};
