import { Command } from "./Command.js";

export class Packet {
    commands: Command[]; 

    constructor() {
        this.commands = [];

    }
}
