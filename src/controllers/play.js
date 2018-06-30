const FOOD_TYPES = {
	CARROT: { spr: "carrot", id: 1, },
	EGG: { spr: "egg", id: 2 },
	MUSHROOM: { spr: "mushroom", id: 3 },
	ONION: { spr: "onion", id: 4 },
	PEPPER: { spr: "pepper", id: 5 },
	POTATO: { spr: "potato", id: 6 },
	NOODLES: { spr: "noodles", id: 7 },
	TOMATO: { spr: "tomato", id: 8 },
};

const FOOD = [ FOOD_TYPES.CARROT, FOOD_TYPES.EGG, FOOD_TYPES.MUSHROOM, FOOD_TYPES.ONION, FOOD_TYPES.PEPPER, FOOD_TYPES.POTATO, FOOD_TYPES.NOODLES, FOOD_TYPES.TOMATO ];

const PLAY_STATES = {
	IN_PLANE: 0,
	FALLING: 1,
	LANDING: 2,
	SCORING: 3
};

class PlayController {
	constructor(params) {
		this.destroyables = [];
		
		this.uiGroup = game.phaser.add.group();
		this.gameGroup = game.phaser.add.group();

		this.uiFrame = game.phaser.add.sprite(0, 0, "frame");
		this.uiPot = game.phaser.add.sprite(18, 420, "pot");
		this.uiLid = game.phaser.add.sprite(18, 390, "lid");

		this.altMeter = game.phaser.add.sprite(61, 80, "alt-meter");
		this.altMarker = game.phaser.add.sprite(81, 58, "alt-marker");
		this.altitude = 12000;
		this.startTime = game.phaser.time.now;

		this.uiGroup.addChild(this.uiFrame);
		this.uiGroup.addChild(this.uiPot);
		this.uiGroup.addChild(this.uiLid);
		this.uiGroup.addChild(this.altMeter);
		this.uiGroup.addChild(this.altMarker);

		this.background = game.phaser.add.tileSprite(162, 16, 618, 564, "background");
		this.gameGroup.addChild(this.background);

		this.player = new Player(this.gameGroup);
		this.player.sprite.y = -100;
		this.food = [];

		this.lastCloudSpawn = -1000;
		this.clouds = [];
		for(let i = 0; i < 50; i++) this.spawnCloud(true);
		this.foodExplosion = [];
		this.planeSprite = game.phaser.add.sprite(0, 100, "plane");
		this.planeSprite.pivot.set(0.5);
		this.planeSprite.anchor.set(0.5);

		this.planeCentered = false;
		game.phaser.add.tween(this.planeSprite)
		.to({ x: 480,  },
			3500, "Quad.easeOut", true, 0)
		.onComplete.add(() => {
			const _this = this;
			setTimeout(() => {
				_this.planeCentered = true;
			}, 700);
		}, this);

		this.gameGroup.addChild(this.planeSprite);

		this.lastFoodSpawn = -1000;

		this.lidOpen = false;
		this.lastOpen = -1000;
		this.lidTween = null;

		this.destroyables.push(this.uiGroup);

		this.state = PLAY_STATES.IN_PLANE;

		this.altText = game.phaser.add.text(24, 30, "12000 ft", {
			font: "18px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 4,
			align: "center"
		});
		this.uiGroup.addChild(this.altText);
	}

	openLid() {
		this.lastOpen = game.phaser.time.now;

		const _this = this;
		setTimeout(() => {
			_this.closeLid();
		}, 550);

		if (this.lidOpen) return;
		this.lidOpen = true;

		if (!!this.lidTween) this.lidTween.stop();

		this.lidTween = game.phaser.add.tween(this.uiLid)
		.to({ x: -50, y: 330, angle: -20 },
			500, "Quad.easeOut", true, 0);
	}
	
	closeLid() {
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
		switch(this.state) {
			case PLAY_STATES.IN_PLANE:
				this.planeUpdate();
				break;
			case PLAY_STATES.FALLING:
				this.fallUpdate();
				break;
			case PLAY_STATES.LANDING:
				this.landUpdate();
				break;
			case PLAY_STATES.SCORING:
				this.scoringUpdate();
				break;
		}

		game.phaser.world.bringToTop(this.uiGroup);
	}

	scoringUpdate() {

	}

	landUpdate() {
		const t = game.phaser.time.now;
		const dt = t - this.startedLanding;

		const e = Math.max(0, (1 - (dt/2000)));

		this.background.tilePosition.y -= 3 * e;

		this.gameGroup.bringToTop(this.player.sprite);
	}
	
	spawnCloud(randx) {
		let newCloud;

		if (randx) {
			newCloud = game.phaser.add.sprite(100 + (Math.random() * 700), 5 + (Math.random()*80), "cloud1");
		} else {
			newCloud = game.phaser.add.sprite(900, 5 + (Math.random()*80), "cloud1");
		}

		this.clouds.push(newCloud);
		this.gameGroup.addChild(newCloud);
		newCloud.speed = 2 + (Math.random()*3);
	}

	planeUpdate() {
		const t = game.phaser.time.now;

		if (t - this.lastCloudSpawn > 100) {
			this.lastCloudSpawn = t;
			this.spawnCloud();
		}

		for(let c of this.clouds) {
			c.x -= c.speed;
		}

		if (this.planeCentered) {
			this.state = PLAY_STATES.FALLING;

			game.phaser.camera.shake(0.5, 500);

			this.startTime = game.phaser.time.now;
			this.player.sprite.x = 480;
			this.player.sprite.y = 100;
			this.player.velocity.y = 6;

			for(let i = 0; i < 60; i++) {
				const f = FOOD[Math.floor(Math.random() * FOOD.length)];
				const spr = game.phaser.add.sprite(480, 90, f.spr);
				spr.velocity = {
					x: (Math.random() * 30) - 15,
					y: (7 + (Math.random() * 9))
				};
				spr.pivot.set(0.5);
				spr.anchor.set(0.5);
				this.gameGroup.addChild(spr);
				this.foodExplosion.push(spr);
			}

			const _this = this;
			setTimeout(() => {
				for(let c of _this.clouds) {
					c.destroy();
				}
				for(let f of _this.foodExplosion) {
					f.destroy();
				}
				_this.clouds = [];
				_this.foodExplosion = [];
			}, 3000);
		}

		this.planeSprite.y = 100 + (Math.sin(t/300)*20);

		this.gameGroup.bringToTop(this.planeSprite);
	}

	fallUpdate() {
		const t = game.phaser.time.now;
		const dt = t - this.startTime;

		this.altText.text = this.altitude + " ft";
		this.altitude = Math.floor(12000 - (dt*0.3));
		this.altMarker.y = 58 + ((1 - (this.altitude/12000))*265);

		for(let f of this.foodExplosion) {
			f.x += f.velocity.x;
			f.y += f.velocity.y;
			f.angle += 8;
		}

		for(let c of this.clouds) {
			c.x -= c.speed;
			c.y -= c.speed*0.8;
		}

		this.planeSprite.y -= 3;

		if (t - this.lastFoodSpawn > 120) {
			this.lastFoodSpawn = t;
			this.spawnFood();
		}

		this.background.tilePosition.y -= 3;
		this.player.update();

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

		if (this.altitude < 0) {
			this.state = PLAY_STATES.LANDING;
			this.altText.text = "0 ft";
			this.startedLanding = game.phaser.time.now;
			this.player.sprite.loadTexture("chef-parachute");
			this.player.sprite.y -= 50;
			this.player.emitter1.destroy();
			this.player.emitter2.destroy();

			game.phaser.add.tween(this.player.sprite)
			.to({ x: 450, y: 450, angle: 0 },
				3000, "Quad.easeOut", true, 0)

			.onComplete.add(() => {
				this.state = PLAY_STATES.SCORING;

				const nTypes = {};
				let j = 0;
				for(let f of this.food) {
					if (f.pickedUp) { 
						if (!nTypes[f.typ.id]) nTypes[f.typ.id] = { ord: j++, n: 1 };
						else nTypes[f.typ.id].n++;

						const countInfo = nTypes[f.typ.id];

						const ntyp = countInfo.n;

						const targetY = 50 + (countInfo.ord * 40);
						const targetX = 300 + (ntyp * 10);

						this.uiGroup.bringToTop(f.sprite);
						game.phaser.add.tween(f.sprite)
						.to({ x: targetX, y: targetY, angle: 720 },
							1000, "Quad.easeOut", true, 0)
					}
				}

				for(let k in nTypes) {
					const countInfo = nTypes[k];
					const txt = game.phaser.add.text(240, 32 + (countInfo.ord*40), countInfo.n.toString(), {
						font: "26px slkscr",
						fill: "#ffffff",
						stroke: "#000000",
						strokeThickness: 4,
						align: "left"
					});
				}
			}, this);


			this.groundSprite = game.phaser.add.sprite(124, 600, "ground1");
			this.gameGroup.addChild(this.groundSprite);

			game.phaser.add.tween(this.groundSprite)
			.to({ y: 430 },
				2000, Phaser.Easing.Linear.None, true, 0);

			for(let f of this.food) {
				this.gameGroup.bringToTop(f.sprite);
				game.phaser.add.tween(f.sprite)
				.to({ y: 440 + (Math.random() * 30), angle: 0 },
					2000, Phaser.Easing.Linear.None, true, 0);
			}
		}
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

		this.typ = typ;
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
			750, "Quad.easeOut", true, 0);

		t.onComplete.add(() => {

		}, this);
	}

	update(landing) {
		if (this.pickedUp) {
		} else {
			this.sprite.position.y += this.speed;
		}
		this.sprite.angle += this.rotationSpeed;
	}
}
