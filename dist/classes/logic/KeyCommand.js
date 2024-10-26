export class KeyCommand {
    cid;
    keyArr;
    // KeyA-Down, KeyD-Down, KeyW-Down, KeyS-Down, Space-Down
    // KeyA-Up, KeyD-Up, KeyW-Up, KeyS-Up, Space-Up
    constructor(cid) {
        this.cid = cid;
        this.keyArr = [];
    }
}
