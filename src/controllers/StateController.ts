import { Command } from "../classes/logic/Command.js";
import { Packet } from "../classes/logic/Packet.js";
import { PlayerInfo } from "../classes/logic/PlayerInfo.js";
import { PlayerContainer } from "../classes/pixi/PlayerContainer.js";
import { Point } from "../pixi.mjs";
import { LobbyController } from "./LobbyController.js";
import { SnapshotController } from "./SnapshotController.js";

export class StateController {
    // pid, cid
    lastAppliedCidMap: Map<number, number>;

    lc: LobbyController;
    snc: SnapshotController;

    constructor(lc: LobbyController, snc: SnapshotController) {
        this.lastAppliedCidMap = new Map<number, number>();
        this.lc = lc;
        this.snc = snc;
    }

    registerPlayer(pid: number): void {
        this.lastAppliedCidMap.set(pid, -1);
    }

    unRegisterPlayer(pid: number): void {
        this.lastAppliedCidMap.delete(pid);
    }

    getLastAppliedCid(pid: number): number {
        return this.lastAppliedCidMap.get(pid)!;
    }

    applyCommands(player: PlayerInfo, p: Packet, receivedAt: number): void {
        // applied asap
        const pc = player.pc;
        let lastAppliedCid = this.lastAppliedCidMap.get(pc.pid)!;

        p.commands.forEach((c: Command, index: number) => {
            if (c.right) {
                pc.rotateRight();
            }
            if (c.left) {
                pc.rotateLeft();
            }
            if (c.forward) {
                pc.moveForward();
            }
            if (c.brake) {
                pc.moveBackward();
            }
            pc.checkWarp();

            pc.updateLocalTransform(); 

            if (c.fire && pc.isAlive) {
                const cStart = index === 0 ? 30 : 15;
                const deltaAssumption = 7;
                const CET = receivedAt - player.getAvgLatency() - 60 - cStart + deltaAssumption;
                const states = this.snc.getPreviousStates(pc.pid === 0 ? 1 : 0, CET);

                const fireData = pc.fireLaser(states);

                const ec = this.lc.getEnemyOf(pc.pid)?.pc;

                if (fireData.doesHit && ec?.isAlive) {
                    ec.decHealth(1);
                    pc.fireStatus.push(fireData.hitPointL);
                } else {
                    pc.fireStatus.push(new Point(-1, -1));
                }
            } else {
                pc.fireStatus.push(new Point(0, 0));
            }

            lastAppliedCid += 1;
        });

        this.lastAppliedCidMap.set(pc.pid, lastAppliedCid);
    }
}
