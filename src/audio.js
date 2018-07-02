const SFX_TYPES = {
	PICKUP1: { 
		key: "pickup1",
		volume: 0.2
	},
	PICKUP2: { 
		key: "pickup2",
		volume: 0.15
	},
	BADPICKUP: { 
		key: "badpickup",
		volume: 0.2
	},
};
 
class GameAudio {
	constructor() {
		this.muted = false;
	}

	toggleMute() {
		this.muted = !this.muted;
		game.phaser.sound.volume = this.muted ? 0 : 1;
		return this.muted;
	}

	playMusic() {
		this.music.play();
	}

	startMusic() {
		if (!!this.music) {
			this.music.destroy();
		}
		this.music = game.phaser.add.audio("theme");
		this.music.loop = true;
		this.music.volume = 0.45;
		this.playMusic();
	}

	startMainMenuMusic() {
		if (!!this.music) {
			this.music.destroy();
		}
		this.music = game.phaser.add.audio("mainmenu");
		this.music.loop = true
		this.music.volume = 0.35;
		this.playMusic();
	}

	playSfx(s) {
		console.log(this.muted, game.phaser.sound.volume);
		const sfx = game.phaser.add.audio(s.key);
		sfx.volume = s.volume;
		sfx.play();
	}
}
