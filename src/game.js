const GAME_STATES = {
	TITLE: 0,
	IN_GAME: 1
};

const controllerCtorLookup = {
	[GAME_STATES.TITLE]: TitleController,
	[GAME_STATES.IN_GAME]: PlayController,
};

class Game {
	constructor() {
		this.setup = {
			preload: this.preload.bind(this),
			create: this.create.bind(this),
			update: this.update.bind(this),
			render: this.render.bind(this)
		};
		
		this.deltaTime = 1;

		this.input = new Input();
		this.utils = new Utils();
		this.audio = new GameAudio();
		this.phaser = new Phaser.Game(800, 600, Phaser.AUTO, "game-host", this.setup, false, false);
	}

	switchState(state, stateParams) {
		this.beginSwitchState(() => {
			if (this.controller) this.controller.destroy();
			this.controller = new (controllerCtorLookup[state])(stateParams);
			this.state = state;
			this.finishSwitchState();
		});
	}

	beginSwitchState(cb) {
		if (this.controller && this.controller.exitTransition) this.controller.exitTransition(cb);
		else this.fadeOut(cb);
	}

	finishSwitchState(cb) {
		if (this.controller && this.controller.enterTransition) this.controller.enterTransition(cb);
		else this.fadeIn(cb);
	}

	fullscreen() {
		this.phaser.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.phaser.scale.startFullScreen(false);
	}

	preload() {
		loader.load(this.phaser);
		this.phaser.time.advancedTiming = true;
	}

	create() {
		this.phaser.physics.startSystem(Phaser.Physics.ARCADE);
		this.input.init();

		this.pixelateFilter = game.phaser.add.filter("Pixelate", 800, 600);
		this.phaser.world.filters = [
				this.pixelateFilter
		];

		this.switchState(GAME_STATES.TITLE);
		
		this.audio.toggleMute();

		game.phaser.stage.backgroundColor = "#121212";

		this.globalGroup = game.phaser.add.group();
		this.fullscreenText = game.phaser.add.text(610, 550, "FULLSCREEN", {
			font: "20px slkscr",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 4,
			align: "left"
		});
		this.fullscreenText.inputEnabled = true;
		this.fullscreenText.events.onInputDown.add(() => {
			this.fullscreen();
		}, this);
		this.globalGroup.addChild(this.fullscreenText);
	}

	fadeOut(cb) {
		const t = this.phaser.add.tween(this.pixelateFilter).to( { sizeX: 20, sizeY: 20 }, 600, "Quad.easeInOut", true, 0);
		if (!!cb) t.onComplete.add(cb);
		//if (!!cb) cb();
	}

	fadeIn(cb) {
		const t = this.phaser.add.tween(this.pixelateFilter).to( { sizeX: 1, sizeY: 1 }, 600, "Quad.easeInOut", true, 0);
		if (!!cb) t.onComplete.add(cb);
		//if (!!cb) cb();
	}

	showTitle(cb) {
		const bg = this.phaser.add.graphics(0, 0);
		bg.beginFill(0xFFFFFF);
		bg.drawRect(0, 0, 800, 600); 

		const logoSpr = this.phaser.add.sprite(400, 300, "logo");
		logoSpr.anchor.set(0.5);

		const _this = this;

		let destroyed = false;
		let tween;

		const destroyCb = () => {
			if (destroyed) return;
			destroyed = true;

			if (!!tween) {
				tween.stop();
				_this.phaser.world.alpha = 1;
			}

			window.removeEventListener("keydown", destroyCb);

			logoSpr.destroy();
			bg.destroy();
			cb();
		};

		window.addEventListener("keydown", destroyCb);
		_this.input.gamepad.onDownCallback = destroyCb;

		const fadeInCb = () => {
			if (destroyed) return;
			tween.onComplete.add(() => {
				setTimeout(() => {
					destroyCb();
				}, 250);
			});
		};
		const tout = setTimeout(fadeInCb, 1150);
	}

	update() {
		this.deltaTime = (this.phaser.time.elapsed/(1000/60)) ;
		if (this.controller) this.controller.update();
		this.input.update();
		this.phaser.debug.text(this.phaser.time.fps || '--', 700, 14, "#00ff00"); 
		this.fullscreenText.bringToTop();
		game.phaser.world.bringToTop(this.globalGroup);
		this.globalGroup.bringToTop(this.fullscreenText);
	}

	render() {
		if (this.controller) this.controller.render();
	}

	reset() {
	}
}

