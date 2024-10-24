import { Edge } from './Edge.js';
import {
    Container, Graphics, Sprite, Point
} from '../../pixi.mjs';
import { ShipShape } from './ShipShape.js';
import { PlayerState } from '../logic/PlayerState.js';
import { closeEnough } from '../../utils.js';

export class PlayerContainer extends Container {
    health: number;
    pid: number;
    rotationSpeed: number;
    accelSpeed: number;

    fireStatus: Point[]; 
    // hit, miss = -1, off = 0
    isAlive: boolean;
    
    constructor(pid: number) {
        super();
        
        const hitbox = new ShipShape();
        hitbox.label = 'hitbox';

        const laser = new Graphics({});
        laser.position.set(0, -30);
        laser.label = 'laser';

        this.health = 100;
        this.fireStatus = [];
        this.pid = pid;
        this.isAlive = false;

        this.addChild(hitbox);
        this.addChild(laser);
        this.rotationSpeed = 0.09;
        this.accelSpeed = 3.1;
    }

    fireLaser(states: PlayerState[]): {doesHit: boolean, hitPointL: Point } {
        for (let i=0; i<states.length; i+= 1) {
            const state = states[i];

            const ec = new PlayerContainer(-1);
            ec.setMovState(state);

            const hitscanData = this.checkHitscanOn(ec);

            if (hitscanData.doesHit) {
                const hitPointL = ec.localTransform.applyInverse(hitscanData.hitPointG);
                return {doesHit: true, hitPointL};
            }
        }

        return {doesHit: false, hitPointL: new Point(-1, -1)};
    }

    checkHitscanOn(enemyContainer: PlayerContainer): {doesHit: boolean, hitPointG: Point } {
        // laser definition
        const theta = this.rotation;
        const origin = ((this.getChildByLabel('laser') as Graphics).getGlobalPosition() as Point); // this is immediately updated, unlike worldTransform

        // check if laser hits each edge
        let doesHit = false;
        let hitPointG = new Point(-1, -1);
        let minDist = Infinity;

        const hitbox = (enemyContainer.getChildByLabel('hitbox') as ShipShape);

        for (let i = 1; i < 5; i++) {
            const va = enemyContainer.localTransform.apply(new Point((hitbox[`e${i}`] as Edge).va.x, (hitbox[`e${i}`] as Edge).va.y));
            const vb = enemyContainer.localTransform.apply(new Point((hitbox[`e${i}`] as Edge).vb.x, (hitbox[`e${i}`] as Edge).vb.y));

            // everything now in global coords since the parent of the containers is app
            const intData = this.#checkRayIntersectSegment(theta, origin, va, vb);
            if (intData.doesIntersect) {
                doesHit = true;

                if (intData.dist < minDist) {
                    minDist = intData.dist;
                    hitPointG = intData.intPoint;
                }
            }
        }

        return { doesHit, hitPointG };
    }

    #checkRayIntersectSegment(theta: number, origin: Point, p1: Point, p2: Point): {doesIntersect: boolean, intPoint: Point, dist: number} {
        // Ray Line Equation
        let m1 = (Math.cos(theta) / Math.sin(theta)) * -1;
        if (m1 === -Infinity || m1 === Infinity) {
            m1 = 123456789123456;
        }
        const b1 = origin.y - (m1 * origin.x);

        // Segment Line Equation
        let m2 = ((p2.y - p1.y) / (p2.x - p1.x));
        if (m2 === -Infinity || m2 === Infinity) {
            m2 = 123456789123456;
        }
        const b2 = p1.y - (m2 * p1.x);

        // parallel lines
        if (m1 === m2 && b1 !== b2) {
            return { doesIntersect: false, intPoint: new Point(), dist: 0 };
        }

        // intersection point
        const ix = (b2 - b1) / (m1 - m2);
        const iy = (m1 * ix) + b1;

        // check if the intersection point is in the segment
        const segMinX = Math.min(p1.x, p2.x);
        const segMinY = Math.min(p1.y, p2.y);
        const segMaxX = Math.max(p1.x, p2.x);
        const segMaxY = Math.max(p1.y, p2.y);

        if (!(ix >= segMinX && ix <= segMaxX && iy >= segMinY && iy <= segMaxY)) {
            return { doesIntersect: false, intPoint: new Point(), dist: 0 };
        }

        // check if the intersection point is behind the player
        const dist = Math.sqrt((ix - origin.x) ** 2 + (iy - origin.y) ** 2);
        const jx = origin.x + (dist * Math.sin(theta));
        const jy = origin.y - (dist * Math.cos(theta));

        if (closeEnough(jx, ix) && closeEnough(jy, iy)) {
            return { doesIntersect: true, intPoint: new Point(ix, iy), dist };
        } else {
            return { doesIntersect: false, intPoint: new Point(), dist: 0 };
        }
    }

    rotateRight(): void {
        this.rotation += this.rotationSpeed;
    }

    rotateLeft(): void {
        this.rotation -= this.rotationSpeed;
    }

    moveForward(): void {
        this.x += this.accelSpeed * Math.sin(this.rotation);
        this.y -= this.accelSpeed * Math.cos(this.rotation);
    }

    moveBackward(): void {
        this.x -= this.accelSpeed * Math.sin(this.rotation);
        this.y += this.accelSpeed * Math.cos(this.rotation);
    }

    checkWarp(): void {
        if (this.x > 500) {
            this.x -= 500;
        } else if (this.x < 0) {
            this.x += 500;
        }

        if (this.y > 500) {
            this.y -= 500;
        } else if (this.y < 0) {
            this.y += 500;
        }
    }

    decHealth(delta: number) {
        if (this.health > 0) {
            this.health -= delta;
        }

        if (this.health < 0) {
            this.health = 0;
        }
    }

    setMovState(ps: PlayerState): void {
        this.position.x = ps.position.x;
        this.position.y = ps.position.y;
        this.rotation = ps.rotation;
        this.updateLocalTransform();
    }
}

