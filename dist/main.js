import { WebSocketServer } from 'ws';
import { PlayerState } from './classes/logic/PlayerState.js';
import { StateController } from './controllers/StateController.js';
import { setCustomInterval } from './utils.js';
import { LobbyController } from './controllers/LobbyController.js';
import { sendWithLatency } from './utils.js';
import { SnapshotController } from './controllers/SnapshotController.js';
const wss = new WebSocketServer({ port: 8080 });
const lc = new LobbyController();
const snc = new SnapshotController();
const sc = new StateController(lc, snc);
console.log("Server is Running");
wss.on('connection', (ws) => {
    ws.on('error', console.error);
    const pid = lc.joinPlayer(ws);
    sc.registerPlayer(pid);
    snc.registerPlayer(pid);
    if (pid === -1) {
        return;
    } // already 2 players playing
    console.log(`Player Connected: ${pid}`);
    sendWithLatency(ws, 'initial', { pid });
    const player = lc.getPlayer(pid);
    const pc = player.pc;
    ws.on('message', (data) => {
        // @ts-ignore
        const message = JSON.parse(data);
        switch (message.type) {
            case 'pong':
                player.saveLatency(Date.now() - player.pingTs);
                break;
            case 'packet': {
                const packet = message.payload.packet;
                sc.applyKeyCommands(player, packet, Date.now());
                break;
            }
        }
    });
    const initState = PlayerState.genRandMovementState();
    pc.setMovState(initState);
    sendWithLatency(ws, 'startSelf', { playerState: initState });
    lc.forOthers(pid, (other) => {
        // if c1 exists, notify c1 of c2
        sendWithLatency(other.ws, 'startEnemy', { playerState: initState });
        const eps = new PlayerState(0, other.pc.pid);
        eps.position.x = other.pc.position.x;
        eps.position.y = other.pc.position.y;
        eps.rotation = other.pc.rotation;
        // if c1 exists, notify c2 of c1
        sendWithLatency(ws, 'startEnemy', { playerState: eps });
    });
    const tid = setTimeout(() => {
        lc.getPlayer(pid).isStarted = true;
        console.log("Starting Client: " + pid);
        setTimeout(() => {
            pc.isAlive = true;
        }, 500);
    }, 1550);
    ws.on('close', () => {
        console.log(`Player Disconnected: ${pid}`);
        lc.forOthers(pid, (other) => {
            // notify other clients of disconnect
            sendWithLatency(other.ws, 'disconnect', { pid });
            other.pc.health = 100;
        });
        lc.disconnectPlayer(pid);
        sc.unRegisterPlayer(pid);
        snc.unRegisterPlayer(pid);
        clearTimeout(tid);
    });
});
setCustomInterval(() => {
    // send updates to clients of themselves, and snapshots to clients of their enemies
    lc.playerArr.forEach((player, pid) => {
        if (!player) {
            return;
        }
        const ws = player.ws;
        const pc = player.pc;
        if (sc.getLastAppliedCid(pid) !== -1) { // if a packet/command has been applied >= is started
            // Send own update to client
            const update = new PlayerState(sc.getLastAppliedCid(pid) + 1, pid);
            update.position.x = pc.position.x;
            update.position.y = pc.position.y;
            update.rotation = pc.rotation;
            update.health = pc.health;
            update.fireStatus = pc.fireStatus;
            pc.fireStatus = [];
            sendWithLatency(ws, 'update', { playerState: update });
            snc.saveSnapshot(pid, update);
            // Send own snapshot to other clients
            lc.forOthers(pid, (other) => {
                if (other.isStarted) { // only receive snapshots of enemy if you are started
                    sendWithLatency(other.ws, 'snapshot', { playerState: update });
                }
            });
            if (update.health <= 0 && pc.isAlive) {
                pc.isAlive = false;
                pc.health = 100;
                const newState = PlayerState.genRandMovementState();
                pc.setMovState(newState);
                lc.forOthers(pid, (other) => {
                    sendWithLatency(other.ws, 'respawnEnemy', {});
                });
                sendWithLatency(ws, 'respawnSelf', {});
                setTimeout(() => {
                    pc.isAlive = true;
                    const enemy = lc.getEnemyOf(pid);
                    if (enemy) {
                        enemy.pc.health = 100;
                    }
                }, 2000);
            }
        }
    });
}, 50);
setCustomInterval(() => {
    // Send pings to each client to determine latency
    lc.playerArr.forEach((player, pid) => {
        if (player) {
            player.pingTs = Date.now();
            sendWithLatency(player.ws, 'ping', {});
        }
    });
}, 250);
