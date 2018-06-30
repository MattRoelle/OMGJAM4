class Utils {
	dist(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
	}

	padZero(n) {
		let s = n.toString();
		if (s.length <= 1) s = "0" + s;
		return s;
	}

	formatTime(dt) {
		const minutes = game.utils.padZero(Math.floor((dt/1000)/60));
		const seconds = game.utils.padZero(Math.floor(dt/1000)%60);
		const subseconds = game.utils.padZero(Math.floor((dt%1000)/10));
		return `${minutes}:${seconds}:${subseconds}`;
	}

	lerp(v0, v1, t) {
		return v0*(1-t)+v1*t;
	}

	textEffect(x, y, c, s) {
		const text = game.phaser.add.text(x, y, s, {
			font: "20px slkscr",
			fill: c,
			stroke: "#000000",
			strokeThickness: 4,
			align: "center"
		});
		text.pivot.set(0.5);
		text.anchor.set(0.5);

		game.phaser.add.tween(text)
		.to({ x: x, y: y - 200, alpha: 0 },
			1250, "Quad.easeOut", true, 0)

		setTimeout(() => {
			text.destroy();
		}, 1500);
	}
}
