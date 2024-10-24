import { Point } from "../pixi.mjs";
export class StateController {
    // pid, cid
    lastAppliedCidMap;
    lc;
    snc;
    constructor(lc, snc) {
        this.lastAppliedCidMap = new Map();
        this.lc = lc;
        this.snc = snc;
    }
    registerPlayer(pid) {
        this.lastAppliedCidMap.set(pid, -1);
    }
    unRegisterPlayer(pid) {
        this.lastAppliedCidMap.delete(pid);
    }
    getLastAppliedCid(pid) {
        return this.lastAppliedCidMap.get(pid);
    }
    applyCommands(player, p, receivedAt) {
        // applied asap
        const pc = player.pc;
        let lastAppliedCid = this.lastAppliedCidMap.get(pc.pid);
        p.commands.forEach((c, index) => {
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
                }
                else {
                    pc.fireStatus.push(new Point(-1, -1));
                }
            }
            else {
                pc.fireStatus.push(new Point(0, 0));
            }
            lastAppliedCid += 1;
        });
        this.lastAppliedCidMap.set(pc.pid, lastAppliedCid);
    }
}
