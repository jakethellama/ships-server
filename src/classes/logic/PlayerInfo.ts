import { WebSocket } from "ws";
import { PlayerContainer } from "../pixi/PlayerContainer.js";
import { Packet } from "./Packet.js";

export class PlayerInfo {
    ws: WebSocket;
    pc: PlayerContainer;
    isStarted: boolean;
    
    pingTs: number;
    latencies: number[];
    li: number;

    constructor(ws: WebSocket, pc: PlayerContainer){ 
        this.ws = ws;
        this.pc = pc;
        this.isStarted = false;

        this.pingTs = -1;
        this.latencies = new Array<number>(5);
        this.li = 0;
    }

    saveLatency(latency: number): void {
        this.latencies[this.li % 5] = latency;
        this.li += 1;
    }

    getAvgLatency(): number {
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