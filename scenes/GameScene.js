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

        // this.setCollideWorldBounds(true);

        // this.setVelocityX(125);
        // this.setBounceX(1);
    }

    update() {
        // if (this.follow) {
        //     this.setPosition(this.initialPosition.x + this.follow.x, this.initialPosition.y + this.follow.y);
        // }
    }
}

class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.enemies = [];
        this.enemies.push(new Enemy(scene, { x: 600, y: 50 }, ));

        // this.setHitArea // TODO: Investigate this?

        this.enemies.forEach((enemy) => {
            this.add(enemy);
            enemy.setVelocityX(125);
        });

        // scene.add.existing(this);

        /*
         * TODO: Add physics group to collider with world, when a collision is detected change the velocity of every child of this.enemies
         *
         * 
         */

        // scene.physics.world.setBoundsCollision();

        // scene.physics.world.on('worldbounds', (body) => console.log('collision'), scene);
    }

    update() {
        this.enemies.forEach((enemy) => {
            enemy.update();
            console.log(enemy.body.velocity.x);
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
