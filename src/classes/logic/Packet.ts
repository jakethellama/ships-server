import { KeyCommand } from "./KeyCommand.js";

export class Packet {
    keyCommands: KeyCommand[]; 

    constructor() {
        this.keyCommands = [];

    }
}
