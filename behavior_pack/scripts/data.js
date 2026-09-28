import { Player } from "@minecraft/server";
import { SimulatedPlayer } from "@minecraft/server-gametest";

export function isRealPlayer(player) {
	return player instanceof Player && !(player instanceof SimulatedPlayer);
}



export class Utils {
	static randomInt(min, max) {
		if (min > max) {
			[min, max] = [max, min];
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static fixFloat(number, n) {
		return Math.floor(number*10**n) / 10**n;
	}

	static formatMS(ms) {
		const totalSec = Math.floor(ms / 1000);
		const h = Math.floor(totalSec / 3600);
		const m = Math.floor((totalSec % 3600) / 60);
		const s = totalSec % 60;
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	}

	static formatMemoryTier(memory) {
		if (memory === 0) return "1.5 GB";
		if (memory === 1) return "2 GB";
		if (memory === 2) return "4 GB";
		if (memory === 3) return "8 GB";
		if (memory === 4) return "12 GB+";
	}

	static getUtf8ByteLength(str) {
		let len = 0;
		for (let i = 0; i < str.length; i++) {
			const code = str.charCodeAt(i);
			if (code < 0x80) {
				len += 1;
			} else if (code < 0x800) {
				len += 2;
			} else if (code < 0xD800 || code > 0xDBFF) {
				len += 3;
			} else {
				len += 4;
				i++;
			}
		}
		return len;
	}

	static getPingColor(ping) {
		if (ping <= 60) return '§a';
		if (ping <= 100) return '§e';
		if (ping <= 200) return '§6';
		if (ping <= 500) return '§c';
		return '§4';
	}

	static getWorldStatus() {
		if (currentTPS >= 20) return "Perfect";
		if (currentTPS >= 18) return "Good";
		if (currentTPS >= 15) return "Fair";
		if (currentTPS >= 10) return "Laggy";
		return "Frozen";
	}
}