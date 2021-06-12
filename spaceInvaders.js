"use strict"

import { GameScene } from './scenes/GameScene.js';

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaserParent',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    pixelArt: true,
    scene: GameScene,
};

let game = new Phaser.Game(config);