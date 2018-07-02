class TitleController {
	constructor() {
		this.destroyables = [];
		this.bg = game.phaser.add.tileSprite(0, 0, 800, 600, "title");
		this.destroyables.push(this.bg);

		this.clouds = [];
		this.lastCloudSpawn = -1000;

		this.food = [];
		this.lastFoodSpawn = -1000;

		this.planeSprite = game.phaser.add.sprite(-300, 100, "plane");
		this.planeSprite.anchor.set(0.5);
		game.phaser.add.tween(this.planeSprite)
		.to({ x: 400 },
			5000, "Quad.easeOut", true, 0);
		this.destroyables.push(this.planeSprite);

		for(let i = 0; i < 50; i++) this.spawnCloud(true);

		this.logoSprite = game.phaser.add.sprite(400, 100, "logo");
		this.logoSprite.anchor.set(0.5);
		this.logoSprite.pivot.set(0.5);

		this.subLogoSprite = game.phaser.add.sprite(400, 200, "sublogo");
		this.subLogoSprite.anchor.set(0.5);
		this.subLogoSprite.pivot.set(0.5);

		this.madeByText = game.phaser.add.text(10, 510, "Made in 48 hours\nfor the OMGJAM4", {
			font: "16px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 4,
			align: "left"
		});
		this.destroyables.push(this.madeByText);

		this.twitterText = game.phaser.add.text(10, 560, "@mattyk1ns", {
			font: "24px slkscr",
			fill: "#1da1f2",
			stroke: "#14171a",
			strokeThickness: 4,
			align: "left"
		});
		this.destroyables.push(this.twitterText);

		this.beginText = game.phaser.add.text(400, 450, "SPACE TO BEGIN", {
			font: "44px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 8,
			align: "Center"
		});
		this.destroyables.push(this.beginText);
		this.beginText.pivot.set(0.5);
		this.beginText.anchor.set(0.5);

		this.started = game.phaser.time.now;
	}

	spawnFood() {
		this.lastFoodSpawn = game.phaser.time.now;
		const f = FOOD[Math.floor(Math.random() * FOOD.length)];
		const s = game.phaser.add.sprite(100 + Math.random()*1100, -100, f.spr);
		s.anchor.set(0.5);
		s.pivot.set(0.5);
		this.destroyables.push(s);
		s.speed = 4 + (Math.random()*4);
		s.rSpeed = 4 + (Math.random()*4);
		s.rSpeed *= (Math.random() < 0.5) ? 1 : -1;
		this.food.push(s);
	}

	spawnCloud(randx) {
		this.lastCloudSpawn = game.phaser.time.now;
		let newCloud;

		if (randx) {
			newCloud = game.phaser.add.sprite((Math.random() * 800) - 50, 5 + (Math.random()*200), "cloud1");
		} else {
			newCloud = game.phaser.add.sprite(900, 5 + (Math.random()*200), "cloud1");
		}

		newCloud.anchor.set(0.5);
		newCloud.pivot.set(0.5);

		this.clouds.push(newCloud);
		this.destroyables.push(newCloud);
		newCloud.speed = 5 + (Math.random()*4);
	}

	update() {
		const t = game.phaser.time.now;
		if (t - this.lastCloudSpawn > 50) {
			this.spawnCloud();
		}

		if (t - this.lastFoodSpawn > 50) {
			this.spawnFood();
		}


		for(let c of this.clouds) {
			c.x -= c.speed * game.deltaTime;
			c.bringToTop();
			if (c.x < -100) {
				c.destroy();
				c.dead = true;
			}
		}
		this.clouds = this.clouds.filter(c => !c.dead);

		this.bg.tilePosition.y -= 1.5 * game.deltaTime;

		this.planeSprite.bringToTop();
		this.planeSprite.y = 350 + (Math.sin(t/500)*30);

		for(let f of this.food) {
			f.y += f.speed*game.deltaTime;
			f.x -= (f.speed/2)*game.deltaTime;
			f.angle += f.rSpeed*game.deltaTime;
			if (f.y > 900) {
				f.destroy();
				f.dead = true;
			}
		}
		this.food = this.food.filter(f => !f.dead);

		this.logoSprite.bringToTop();
		this.subLogoSprite.bringToTop();
		this.beginText.bringToTop();

		if (game.phaser.time.now - this.started > 750 && game.input.isJumpDown()) {
			game.switchState(GAME_STATES.IN_GAME);
		}
	}

	render() {

	}

	destroy() {
		for(let d of this.destroyables) d.destroy();
	}
}
