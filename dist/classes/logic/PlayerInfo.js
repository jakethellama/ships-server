export class PlayerInfo {
    ws;
    pc;
    isStarted;
    pingTs;
    latencies;
    li;
    constructor(ws, pc) {
        this.ws = ws;
        this.pc = pc;
        this.isStarted = false;
        this.pingTs = -1;
        this.latencies = new Array(5);
        this.li = 0;
    }
    saveLatency(latency) {
        this.latencies[this.li % 5] = latency;
        this.li += 1;
    }
    getAvgLatency() {
        let tot = 0;
        let n = 0;
        this.latencies.forEach((l) => {
            if (l) {
                tot += l;
                n += 1;
            }
        });
        return tot / n;
    }
}
