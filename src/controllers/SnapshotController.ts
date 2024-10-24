import { PlayerState } from "../classes/logic/PlayerState.js";

export class SnapshotController {
    // pid, HistoryInfo
    historyMap: Map<number, HistoryInfo>;

    constructor() {
        this.historyMap = new Map<number, HistoryInfo>;

    }

    registerPlayer(pid: number): void {
        this.historyMap.set(pid, {
            snapHistory: new Array<PlayerState>(100),
            storeIndex: 0,
            firstTs: -1
        });
    }

    unRegisterPlayer(pid: number): void {
        this.historyMap.delete(pid);
    }

    saveSnapshot(pid: number, snapshot: PlayerState): void {
        const player = this.historyMap.get(pid);
        if (!player) { return; }

        player.snapHistory[player.storeIndex % 100] = snapshot;

        if (player.storeIndex === 0) {
            player.firstTs = Date.now();
        }

        player.storeIndex += 1;

    }

    getPreviousStates(pid: number, CET: number): PlayerState[] {
        // gets the state prior to CET
        const player = this.historyMap.get(pid);
        if (!player) { return []; }
        if (Date.now() - CET > 2000) { return []; }

        const since = CET - player.firstTs;
        const i = Math.floor(since / 50);
        const d = since % 50;

        if (i === 0 && d < 15) {
            return [player.snapHistory[0]];
        }

        const states = [];

        if (d < 15) {
            const prev = player.snapHistory[(i - 1) % 100];
            const cur = player.snapHistory[i % 100];
            if (cur && prev) {
                states.push(cur);
                // states.push(this.interpStateAt(prev, cur, 30));
            }
            
        } else if (d < 30) {
            const cur = player.snapHistory[i % 100];
            const next = player.snapHistory[(i + 1) % 100];
            if (cur && next) {
                states.push(this.interpStateAt(cur, next, 15));
                // states.push(cur);
            }

        } else {
            const cur = player.snapHistory[i % 100];
            const next = player.snapHistory[(i + 1) % 100];
            if (cur && next) {
                states.push(this.interpStateAt(cur, next, 30));
                // states.push(this.interpStateAt(cur, next, 15));
            }
            

        }

        return states;
    }

    interpStateAt(prev: PlayerState, cur: PlayerState, ms: number): PlayerState {
        // return interpolated state at ms ms 
        // 50 ms between prev and cur

        const out = new PlayerState(-1, prev.pid);

        if (cur.position.y - prev.position.y > 300) {
            // top edge warp
            out.position.y = this.interpValueAt(prev.position.y + 500, cur.position.y, ms) % 500;
        } else if (prev.position.y - cur.position.y > 300) {
            // bottom edge warp
            out.position.y = this.interpValueAt(prev.position.y, cur.position.y + 500, ms) % 500;
        } else {
            // no warp
            out.position.y = this.interpValueAt(prev.position.y, cur.position.y, ms);
        }

        if (cur.position.x - prev.position.x > 300) {
            // left edge warp
            out.position.x = this.interpValueAt(prev.position.x + 500, cur.position.x, ms) % 500;
        } else if (prev.position.x - cur.position.x > 300) {
            // right edge warp
            out.position.x = this.interpValueAt(prev.position.x, cur.position.x + 500, ms) % 500;
        } else {
            // no warp
            out.position.x = this.interpValueAt(prev.position.x, cur.position.x, ms);
        }

        out.rotation = this.interpValueAt(prev.rotation, cur.rotation, ms);
        
        return out;
    }

    interpValueAt(a: number, b: number, ms: number): number {
        // return interpolated value at ms ms
        // 50 ms between a and b

        return a + (ms * (b - a) / 50);
    }

}

interface HistoryInfo {
    snapHistory: PlayerState[];
    storeIndex: number;
    firstTs: number;
}
