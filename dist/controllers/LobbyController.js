import { PlayerInfo } from "../classes/logic/PlayerInfo.js";
import { PlayerContainer } from "../classes/pixi/PlayerContainer.js";
export class LobbyController {
    playerArr;
    playerNum;
    constructor() {
        this.playerArr = [null, null];
        this.playerNum = 0;
    }
    joinPlayer(ws) {
        if (this.playerNum >= 2) {
            return -1;
        } // already max 2 players
        this.playerNum += 1;
        const pid = (this.playerArr[0] === null ? 0 : 1);
        const pc = new PlayerContainer(pid);
        this.playerArr[pid] = new PlayerInfo(ws, pc);
        return pid;
    }
    disconnectPlayer(pid) {
        this.playerArr[pid] = null;
        this.playerNum -= 1;
    }
    getPlayer(pid) {
        return this.playerArr[pid];
    }
    getEnemyOf(pid) {
        return this.playerArr[pid === 0 ? 1 : 0];
    }
    forOthers(selfId, todo) {
        this.playerArr.forEach((player, pid) => {
            if (!player || pid === selfId) {
                return;
            }
            todo(player);
        });
    }
}
