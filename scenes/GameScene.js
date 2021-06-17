"use strict"

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, group, reverse) {
        super(scene, x, y, 'white');
        this.setTint(0xff0000);
        this.setScale(8, 8);
        scene.physics.add.existing(this);
        if (group) {
            group.add(this);
        }
        this.setVelocityY((reverse ? -1 : 1) * -300);
        scene.add.existing(this);

        scene.time.addEvent({ delay: 1750, callback: this.destroy, callbackScope: this });
    }
}

class ShootingObject extends Phaser.Physics.Arcade.Sprite {
    shoot(reverse = false) {
        // This annoys SonarLint so there may be a way to refactor this constructor to just be a function.
        new Bullet(this.scene, this.x, this.y + (reverse ? 32 : -32), this.bulletGroup, reverse);
    }
}

class Player extends ShootingObject {
    firingRate = 2.5;

    constructor(scene) {
        super(scene, 400, 525, 'ship');
        this.setTint(0x00ff00);
        this.setScale(4, 4);
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true); // This has to come after it is added to physics
        scene.add.existing(this);
        this.lastShot = 0;

        this.bulletGroup = scene.physics.add.group();
    }

    setEnemyGroup(enemyGroup) {
        this.enemyGroup = enemyGroup;

        this.scene.physics.add.collider(enemyGroup, this.bulletGroup, (enemy, bullet) => {
            enemy.destroy();
            bullet.destroy();
        }, null, this);
    }

    shoot() {
        if ((this.scene.time.now - this.lastShot) / 1000 >= 1 / this.firingRate) {
            super.shoot();
            this.lastShot = this.scene.time.now;
        }
    }
}

class Enemy extends ShootingObject {
    constructor(scene, initialPosition = { x: 400, y: 50 }, follow = null, bulletGroup = null) {
        super(scene, initialPosition.x, initialPosition.y, 'ship');

        this.initialPosition = initialPosition;
        this.follow = follow;
        this.bulletGroup = bulletGroup;
        
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
        this.hitbox = scene.add.rectangle(150, 150, 300, 300);
        this.hitbox = scene.physics.add.existing(this.hitbox);
        this.hitbox.body.setCollideWorldBounds(true);
        this.hitbox.body.setBounceX(1);
        this.hitbox.body.setVelocityX(125);

        this.bulletGroup = scene.physics.add.group();

        // Add enemies
        this.enemies = [];
        this.enemies.push(new Enemy(scene, { x: -75, y: -75 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: 0, y: -75 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: 75, y: -75 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: -75, y: 0 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: 0, y: 0 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: 75, y: 0 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: -75, y: 75 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: 0, y: 75 }, this.hitbox, this.bulletGroup));
        this.enemies.push(new Enemy(scene, { x: 75, y: 75 }, this.hitbox, this.bulletGroup));

        // Add the enemies to the physics group
        this.enemies.forEach((enemy) => {
            this.add(enemy);
        });

        this.lastShot = 0;
    }

    setPlayer(player) {
        this.player = player;

        this.scene.physics.add.collider(player, this.bulletGroup, (hitPlayer, bullet) => {
            hitPlayer.destroy();
            bullet.destroy();
        }, null, this);
    }

    update() {
        if (this.scene.time.now - this.lastShot >= 1000) {
            this.randomShot();
            this.lastShot = this.scene.time.now;
        }

        // Update each enemy so they follow the hitbox
        this.enemies.forEach((enemy) => {
            enemy.update();
        });
    }

    randomShot() {
        let shootingEnemy = Phaser.Math.Between(0, this.enemies.length - 1);

        // If the enemy isn't active, don't shoot. Individually the fire rate should remain
        // about the same just by ignoring the inactive ones (in theory).
        if (this.enemies[shootingEnemy].active) {
            this.enemies[shootingEnemy].shoot(true);
        }
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

        this.player.setEnemyGroup(this.enemyGroup);
        this.enemyGroup.setPlayer(this.player);

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
       if (this.player.active) {
           this.handleControls();
       }
           
        this.enemyGroup.update();
    }
}
