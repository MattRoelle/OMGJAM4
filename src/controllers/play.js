const FOOD_TYPES = {
	CARROT: { spr: "carrot", },
	EGG: { spr: "egg", },
	MUSHROOM: { spr: "mushroom" },
	ONION: { spr: "onion" },
	PEPPER: { spr: "pepper" },
	POTATO: { spr: "potato" },
	NOODLES: { spr: "noodles" },
	TOMATO: { spr: "tomato" },
};

const FOOD = [ FOOD_TYPES.CARROT, FOOD_TYPES.EGG, FOOD_TYPES.MUSHROOM, FOOD_TYPES.ONION, FOOD_TYPES.PEPPER, FOOD_TYPES.POTATO, FOOD_TYPES.NOODLES, FOOD_TYPES.TOMATO ];

class PlayController {
	constructor(params) {
		this.destroyables = [];
		
		this.uiGroup = game.phaser.add.group();
		this.gameGroup = game.phaser.add.group();

		this.uiFrame = game.phaser.add.sprite(0, 0, "frame");
		this.uiPot = game.phaser.add.sprite(18, 420, "pot");
		this.uiLid = game.phaser.add.sprite(18, 390, "lid");
		this.uiGroup.addChild(this.uiFrame);
		this.uiGroup.addChild(this.uiPot);
		this.uiGroup.addChild(this.uiLid);

		this.background = game.phaser.add.tileSprite(162, 16, 618, 564, "background");
		this.gameGroup.addChild(this.background);

		this.player = new Player(this.gameGroup);
		this.food = [];

		this.lastFoodSpawn = -1000;

		this.lidOpen = false;
		this.lastOpen = -1000;
		this.lidTween = null;

		this.destroyables.push(this.uiGroup);
	}

	openLid() {
		this.lastOpen = game.phaser.time.now;

		const _this = this;
		setTimeout(() => {
			_this.closeLid();
		}, 1100);

		if (this.lidOpen) return;
		this.lidOpen = true;

		if (!!this.lidTween) this.lidTween.stop();

		this.lidTween = game.phaser.add.tween(this.uiLid)
		.to({ x: 18, y: 300, angle: -20 },
			500, "Quad.easeOut", true, 0);
	}
	
	closeLid() {
		console.log("c");
		if (!this.lidOpen) return;
		if (game.phaser.time.now - this.lastOpen < 500) return;

		this.lidOpen = false;
		if (!!this.lidTween) this.lidTween.stop();

		this.lidTween = game.phaser.add.tween(this.uiLid)
		.to({ x: 18, y: 390, angle: 0 },
			500, "Quad.easeOut", true, 0);
	}

	spawnFood() {
		this.food.push(new Food(FOOD[Math.floor(Math.random() * FOOD.length)], this.gameGroup, this.uiGroup));
	}

	update() {
		const t = game.phaser.time.now;

		if (t - this.lastFoodSpawn > 300) {
			this.lastFoodSpawn = t;
			this.spawnFood();
		}

		this.background.tilePosition.y -= 3;
		this.player.update();
		game.phaser.world.bringToTop(this.uiGroup);

		for(let f of this.food) {
			if (game.utils.dist(this.player.sprite.x, this.player.sprite.y, f.sprite.x, f.sprite.y) < 35) {
				f.pickup();
				this.uiGroup.bringToTop(this.uiLid)
				this.openLid();
			}
			f.update();

			if (f.sprite.y < -100) {
				f.sprite.destroy();
				f.dead = true;
			}
		}

		this.food = this.food.filter(f => !f.dead);
	}

	render() {
	}

	destroy() {
		for(let d of this.destroyables) d.destroy();
	}
}

class Player {
	constructor(grp) {

		this.sprite = game.phaser.add.sprite(500, 300, "chef-falling");
		grp.addChild(this.sprite);

		this.sprite.pivot.set(0.5);
		this.sprite.anchor.set(0.5);

		this.emitter1 = this.setupEmitter();
		grp.addChild(this.emitter1);

		this.emitter2 = this.setupEmitter();
		grp.addChild(this.emitter2);

		this.grp = grp;

		this.velocity = { x: 0, y: 0 };
	}

	setupEmitter() {
		const emitter = game.phaser.add.emitter(0, 0, 400);
		emitter.gravity = 0;
		emitter.forceQuantity = 2;
		emitter.makeParticles(["particle1", "particle2", "particle3", "particle4"]);
		emitter.setScale(1, 0.3, 1, 0.3, 2000);
		emitter.start(false, 3000, 1);
		emitter.frequency = 50;
		emitter.setXSpeed(-50, 50);
		emitter.setYSpeed(-500, -500);
		emitter.area = new Phaser.Rectangle(-5, -5, 10, 10);
		return emitter;
	}

	update() {
		if (game.input.left()) {
			this.velocity.x -= 0.2;
		} else if (game.input.right()) {
			this.velocity.x += 0.2;
		}

		if (game.input.down()) {
			this.velocity.y += 0.2;
		} else if (game.input.up()) {
			this.velocity.y -= 0.2;
		}

		this.sprite.position.x += this.velocity.x;
		this.sprite.position.y += this.velocity.y;

		this.sprite.position.x = Math.max(this.sprite.position.x, 174);
		this.sprite.position.x = Math.min(this.sprite.position.x, 800 - 32);
		if (this.sprite.position.x <= 174 || this.sprite.position.x >= 800 - 32) {
			this.velocity.x *= -0.5;
		}

		this.sprite.position.y = Math.max(this.sprite.position.y, 42);
		this.sprite.position.y = Math.min(this.sprite.position.y, 600 - 48);
		if (this.sprite.position.y <= 42 || this.sprite.position.y >= 600 - 48) {
			this.velocity.y *= -0.5;
		}

		this.velocity.x *= 0.98;
		this.velocity.y *= 0.98;

		this.sprite.angle = game.utils.lerp(this.sprite.angle, -this.velocity.x*4, 0.15);

		this.grp.bringToTop(this.sprite);

		this.emitter1.x = this.sprite.x;
		this.emitter1.y = this.sprite.y;
		this.emitter2.x = this.sprite.x;
		this.emitter2.y = this.sprite.y;
	}

	render() {

	}

	destroy() {
		this.sprite.destroy();
	}
}

class Food {
	constructor(typ, grp, uigrp) {
		this.sprite = game.phaser.add.sprite(160 + (Math.random()*600), 700, typ.spr);
		this.sprite.pivot.set(0.5);
		this.sprite.anchor.set(0.5);
		grp.addChild(this.sprite);
		this.speed = (-3*Math.random()) - 1.5;
		this.pickedUp = false;
		this.rotationSpeed = -6 + (Math.random()*12);

		if (this.rotationSpeed < 1 && this.rotationspeed > -1) this.rotationSpeed = 1;

		this.grp = grp;
		this.uigrp = uigrp;
	}

	pickup() {
		if (this.pickedUp) return;
		this.pickedUp = true;

		this.grp.removeChild(this.sprite);
		this.uigrp.addChild(this.sprite);
		this.uigrp.bringToTop(this.sprite);

		const t = game.phaser.add.tween(this.sprite)
		.to({ x: 50 + (Math.random()*60), y: 430 + Math.random()*20, angle: this.sprite.angle + 720 },
			500, "Quad.easeOut", true, 0);

		t.onComplete.add(() => {

		}, this);
	}

	update() {
		if (this.pickedUp) {
		} else {
			this.sprite.position.y += this.speed;
		}
		this.sprite.angle += this.rotationSpeed;
	}
}
