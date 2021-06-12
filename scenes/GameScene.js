"use strict"

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'white');
        this.setTint(0xff0000);
        this.setScale(8, 8);
        scene.physics.add.existing(this);
        this.setVelocityY(-300);
        scene.add.existing(this);

        scene.time.addEvent({ delay: 1750, callback: this.destroy, callbackScope: this });
    }
}

class Player extends Phaser.Physics.Arcade.Sprite {
    firingRate = 2.5;

    constructor(scene) {
        super(scene, 400, 525, 'ship');
        this.scene = scene;
        this.setTint(0x00ff00);
        this.setScale(4, 4);
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.lastShot = 0;
    }

    shoot() {
        if ((this.scene.time.now - this.lastShot) / 1000 >= 1 / this.firingRate) {
            new Bullet(this.scene, this.x, this.y - 32);
            this.lastShot = this.scene.time.now;
        }
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, initialPosition = { x: 400, y: 50 }, follow = null) {
        super(scene, initialPosition.x, initialPosition.y, 'ship');
        
        this.scene = scene;
        this.initialPosition = initialPosition;
        this.follow = follow;
        
        this.setFlipY(true);
        this.setTint(0xccaa00);
        this.setScale(4, 4);

        scene.physics.add.existing(this);
        scene.add.existing(this);
    }

    update() {
        if (this.follow) {
            this.setPosition(this.initialPosition.x + this.follow.x, this.initialPosition.y + this.follow.y);
        }
    }
}

class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        // Setup group hitbox
        this.go = scene.add.rectangle(0, 0, 300, 300);
        this.go.setOrigin(0, 0);
        this.go = scene.physics.add.existing(this.go);
        this.go.body.setCollideWorldBounds(true);
        this.go.body.setBounceX(1);
        this.go.body.setVelocityX(125);

        // Add enemies
        this.enemies = [];
        this.enemies.push(new Enemy(scene, { x: 50, y: 50 }, this.go));
        this.enemies.push(new Enemy(scene, { x: 125, y: 50 }, this.go));
        this.enemies.push(new Enemy(scene, { x: 200, y: 50 }, this.go));
        this.enemies.push(new Enemy(scene, { x: 50, y: 125 }, this.go));
        this.enemies.push(new Enemy(scene, { x: 125, y: 125 }, this.go));
        this.enemies.push(new Enemy(scene, { x: 200, y: 125 }, this.go));

        // Add the enemies to the physics group
        this.enemies.forEach((enemy) => {
            this.add(enemy);
        });
    }

    update() {
        // Update each enemy so they follow the hitbox
        this.enemies.forEach((enemy) => {
            enemy.update();
        });
    }
}

export class GameScene extends Phaser.Scene {
    preload() {
        this.load.setBaseURL('../assets');
        this.load.image('white', 'textures/white.png');
        this.load.image('ship', 'textures/ship.png');
    }

    create() {
        this.player = new Player(this);
        this.enemyGroup = new EnemyGroup(this);

        this.keys = this.input.keyboard.addKeys({
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right',
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
    }

    handleControls() {
        let velocityX = 0;

        if (this.keys.left.isDown) {
            velocityX -= 250;
        }

        if (this.keys.right.isDown) {
            velocityX += 250;
        }

        this.player.setVelocityX(velocityX);

        if (this.keys.space.isDown) {
            this.player.shoot();
        }
    }

    update() {
        this.handleControls();
        this.enemyGroup.update();
    }
}
