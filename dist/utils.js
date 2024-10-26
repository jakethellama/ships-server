// @ts-ignore
export function setCustomInterval(fn, ms) {
    const on = [true];
    intervals.set(intervalId, on);
    intervalId += 1;
    customLoop(Date.now() + ms, fn, ms, on);
    return intervalId - 1;
}
export function clearCustomInterval(id) {
    const on = intervals.get(id);
    if (on) {
        on[0] = false;
        clearTimeout(on[1]);
        intervals.delete(id);
    }
}
const intervals = new Map();
let intervalId = 0;
// @ts-ignore
function customLoop(next, fn, ms, on) {
    if (on[0]) {
        on[1] = setTimeout(() => {
            fn();
            customLoop(next + ms, fn, ms, on);
        }, next - Date.now());
    }
}
export const sendWithLatency = (ws, type, payload) => {
    setTimeout(() => {
        ws.send(JSON.stringify({ type, payload }));
    }, 100 / 2);
};
export const closeEnough = function (x, y) {
    return Math.abs(x - y) < 0.01;
};
