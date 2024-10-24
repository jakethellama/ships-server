import { Matrix, Point } from "../../pixi.mjs";
import { PlayerContainer } from "../pixi/PlayerContainer.js";

export class PlayerState {
    // Command0 + State0 = State1
    sid: number;    // state ID
    pid: number;    // player ID
    position: Point;
    rotation: number;
    health: number;
    fireStatus: Point[]; 
    // hit, miss = -1, off = 0

    constructor(sid: number, pid: number) {
        this.sid = sid;
        this.pid = pid;
        this.position = new Point(0, 0);
        this.rotation = 0;
        this.health = 100;
        this.fireStatus = [];
    }

    isEquals(other: PlayerState): boolean {
        return (this.position.x === other.position.x
            && this.position.y === other.position.y
            && this.rotation === other.rotation
        );
    }

    static genRandMovementState(): PlayerState {
        const out = new PlayerState(-1, -1);
        const r = (Math.random() * 500);
        out.position.x = r;
        out.position.y = (400 - r);
        out.rotation = Math.random() * 1.98 * Math.PI + 0.01;

        return out;
    }
}