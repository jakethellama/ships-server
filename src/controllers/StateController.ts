import { KeyCommand } from "../classes/logic/KeyCommand.js";
import { Packet } from "../classes/logic/Packet.js";
import { PlayerInfo } from "../classes/logic/PlayerInfo.js";
import { PlayerContainer } from "../classes/pixi/PlayerContainer.js";
import { Point } from "../pixi.mjs";
import { clearCustomInterval, setCustomInterval } from "../utils.js";
import { LobbyController } from "./LobbyController.js";
import { SnapshotController } from "./SnapshotController.js";

export class StateController {
    stateInfoMap: Map<number, StateInfo>;

    lc: LobbyController;
    snc: SnapshotController;

    keyStateMap: Map<number, KeyState>;

    constructor(lc: LobbyController, snc: SnapshotController) {
        this.stateInfoMap = new Map<number, StateInfo>();
        this.lc = lc;
        this.snc = snc;

        this.keyStateMap = new Map<number, KeyState>();
    }

    registerPlayer(pid: number): void {
        const si = {
            lastAppliedCid: -1,
            firstPacketTs: -1,
            lastReceivedCid: -1,
            loopInterval: undefined,
            loopTimeout: undefined
        };

        this.stateInfoMap.set(pid, si);

        const ks = {
            KeyA: { isPressed: false },
            KeyD: { isPressed: false },
            KeyW: { isPressed: false },
            KeyS: { isPressed: false },
            Space: { isPressed: false },
        };

        this.keyStateMap.set(pid, ks);
    }

    unRegisterPlayer(pid: number): void {
        const si = this.stateInfoMap.get(pid);
        if (si?.loopTimeout) {
            clearTimeout(si.loopTimeout);
        }
        if (si?.loopInterval) {
            clearCustomInterval(si.loopInterval);
        }
        this.stateInfoMap.delete(pid);
        this.keyStateMap.delete(pid);
    }

    getLastAppliedCid(pid: number): number {
        return this.stateInfoMap.get(pid)!.lastAppliedCid;
    }

    applyKeyCommands(player: PlayerInfo, p: Packet, receivedAt: number): void {
        const pc = player.pc;
        const si = this.stateInfoMap.get(pc.pid);
        const ks = this.keyStateMap.get(pc.pid);
        if (!si) { return; }
        if (!ks) { return; }

        if (p.keyCommands[0].cid === si.lastAppliedCid + 1) {
            // regular packet arrival, can increment cid when applied
            p.keyCommands.forEach((kc: KeyCommand, index: number) => {
                this.#mutateKeyState(kc, ks);

                this.#applyKeyStateOnPlayerContainer(ks, pc, index, receivedAt, player);
    
                si.lastAppliedCid += 1;
            });

            si.lastReceivedCid = p.keyCommands[1].cid;

        } else if (p.keyCommands[0].cid > si.lastReceivedCid){
            // late packet, cannot increment cid when applied
            p.keyCommands.forEach((kc: KeyCommand, index: number) => {
                this.#mutateKeyState(kc, ks);
    
                this.#applyKeyStateOnPlayerContainer(ks, pc, index, receivedAt, player);
            });

            si.lastReceivedCid = p.keyCommands[1].cid;
        } else {
            // fradulent message
        }

        // on first packet
        if (si.firstPacketTs === -1) {
            si.firstPacketTs = Date.now();

            si.loopTimeout = setTimeout(() => {
                si.loopInterval = setCustomInterval(() => {
                    const expectedCid = 1 + (2 * Math.floor((Date.now() - si.firstPacketTs) / 30));
                    
                    // if the expected command hasn't arrived yet, assume a state without it
                    if (si.lastAppliedCid !== expectedCid) {
                        const fakeReceivedAt = Date.now() - 10;

                        // assume no change in key state for 2 commands 
                        for (let index=0; index < 2; index += 1) {
                            this.#applyKeyStateOnPlayerContainer(ks, pc, index, fakeReceivedAt, player);
                
                            si.lastAppliedCid += 1;
                        }
                    }
                }, 30);
            }, 9);

        }

    }

    #mutateKeyState(kc: KeyCommand, ks: KeyState): void {
        kc.keyArr.forEach((keyUD: string) => {
            const parts = keyUD.split("-");   // ["KeyS", "Down"]
            if (parts[1] === "Down") {
                ks[parts[0] as keyof KeyState].isPressed = true;
            } else {
                ks[parts[0] as keyof KeyState].isPressed = false;
            }
        });
    }

    #applyKeyStateOnPlayerContainer(ks: KeyState, pc: PlayerContainer, index: number, receivedAt: number, player: PlayerInfo): void {
        if (ks.KeyD.isPressed) {
            pc.rotateRight();
        }
        if (ks.KeyA.isPressed) {
            pc.rotateLeft();
        }
        if (ks.KeyW.isPressed) {
            pc.moveForward();
        }
        if (ks.KeyS.isPressed) {
            pc.moveBackward();
        }
        pc.checkWarp();

        pc.updateLocalTransform(); 

        if (ks.Space.isPressed && pc.isAlive) {
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
    }
}

interface KeyState {
    KeyA: { isPressed: boolean },
    KeyD: { isPressed: boolean },
    KeyW: { isPressed: boolean },
    KeyS: { isPressed: boolean },
    Space: { isPressed: boolean },
}

interface StateInfo {
    lastAppliedCid: number
    firstPacketTs: number;
    lastReceivedCid: number;
    loopInterval: number | undefined;
    loopTimeout: NodeJS.Timeout | undefined;
}
