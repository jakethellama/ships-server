export class ActCommand {
    // ActCommand0 + State0 = State1
    cid;
    right;
    left;
    forward;
    brake;
    fire;
    constructor(cid) {
        this.cid = cid;
        this.right = false;
        this.left = false;
        this.forward = false;
        this.brake = false;
        this.fire = false;
    }
}
