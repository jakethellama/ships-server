import { PlayerInfo } from "../classes/logic/PlayerInfo.js";
import { PlayerContainer } from "../classes/pixi/PlayerContainer.js";
import WebSocket from "ws";

export class LobbyController {
    playerArr: (PlayerInfo | null)[];
    playerNum: number;

    constructor() {
        this.playerArr = [null, null];
        this.playerNum = 0;

    }

    joinPlayer(ws: WebSocket): number {
        if (this.playerNum >= 2) { return -1; } // already max 2 players
        this.playerNum += 1;

        const pid = (this.playerArr[0] === null ? 0 : 1);
        const pc = new PlayerContainer(pid);

        this.playerArr[pid] = new PlayerInfo(ws, pc);
        return pid;
    }

    disconnectPlayer(pid: number): void {
        this.playerArr[pid] = null;
        this.playerNum -= 1;
    }

    getPlayer(pid: number): PlayerInfo {
        return this.playerArr[pid]!;
    }

    getEnemyOf(pid: number): PlayerInfo | null {
        return this.playerArr[pid === 0 ? 1 : 0];
    }

    forOthers(selfId: number, todo: (other: PlayerInfo) => void) {
        this.playerArr.forEach((player: PlayerInfo | null, pid: number) => {
            if (!player || pid === selfId) { return; }

            todo(player);
        });
    }
}