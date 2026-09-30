import { Player } from "@minecraft/server";
import { SimulatedPlayer } from "@minecraft/server-gametest";



export function isRealPlayer(player) {
	return player instanceof Player && !(player instanceof SimulatedPlayer);
}



export class Basic {
	static randomInt(min, max) {
		if (min > max) {
			[min, max] = [max, min];
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static clamp(num, min, max) {
		return Math.min(Math.max(num, min), max);
	}

	static fixFloat(number, n) {
		return Math.floor(number * 10 ** n) / 10 ** n;
	}

	static roundFloat(number, n) {
		const factor = 10 ** n;
		return Math.round(number * factor) / factor;
	}

	static deepClone(obj) {
		if (obj === null || typeof obj !== "object") return obj;
		if (Array.isArray(obj)) return obj.map(Basic.deepClone);
		const result = {};
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				result[key] = Basic.deepClone(obj[key]);
			}
		}
		return result;
	}

	static isEmpty(value) {
		if (value == null) return true;
		if (typeof value === "string") return value.trim() === "";
		if (Array.isArray(value)) return value.length === 0;
		if (typeof value === "object") {
			if (value instanceof Date || value instanceof RegExp) return false;
			return Object.keys(value).length === 0;
		}
		if (typeof value === "number") return Number.isNaN(value);
		return false;
	}
	
	static sameType(a, b) {
		if (a === null || b === null) return a === b;
		if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b);
		return typeof a === typeof b;
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
}



export class Functional {
	static textCheck(message) {
		// Length
		if (Basic.getUtf8ByteLength(message) >= 256) throw new Error("Too many characters");

		// Invalid
		if (/[\u0300-\u036f]{3,}|\u200b|\u200c|\u200d|\u2060|\uFEFF/.test(message)) throw new Error("Invalid characters");

		// Pass
		return;
	}
}



export class Display {
	static formatMS(ms) {
		const totalSec = Math.floor(ms / 1000);
		const h = Math.floor(totalSec / 3600);
		const m = Math.floor((totalSec % 3600) / 60);
		const s = totalSec % 60;
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}

	static formatCount(num) {
		if (num < 1000) return String(num);
		if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
		if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
		return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
	}

	static formatMemoryTier(memory) {
		const tiers = ["1.5 GB", "2 GB", "4 GB", "8 GB", "12 GB+"];
		return tiers[memory] ?? "Unknown";
	}

	static getPingColor(ping) {
		if (ping <= 60) return "§a";
		if (ping <= 100) return "§e";
		if (ping <= 200) return "§6";
		if (ping <= 500) return "§c";
		return "§4";
	}

	static getWorldStatus(tps) {
		if (tps >= 20) return "Perfect";
		if (tps >= 18) return "Good";
		if (tps >= 15) return "Fair";
		if (tps >= 10) return "Laggy";
		return "Frozen";
	}
}



export class Data {
	static cache = new Map();

	static has(player) {
		if (typeof player === "string") return this.cache.has(player);
		if (isRealPlayer(player)) return this.cache.has(player.name);
		throw new Error("Invalid Player");
	}

	static create(name) {
		if (this.has(name)) return this.cache.get(name);

		const data = {
			temp: {},
			perm: {},
			_isCompleteInit: false
		}

		this.cache.set(name, data);

		return data;
	}

	static get(player) {
		if (typeof player === "string") return this.create(player);
		if (isRealPlayer(player)) return this.create(player.name);
		throw new Error("Invalid Player");
	}

	static load(player) {
		const data = this.get(player);
		const permData = (player.getDynamicProperty("data"));

		if (permData) Object.assign(data.perm, JSON.parse(permData));

		return data;
	}

	static init(player) {
		const data = this.get(player);

		if (data._isCompleteInit) return false;

		this.load(player);

		data._isCompleteInit = true;

		return true;
	}

	static save(player) {
		const data = this.get(player);

		player.setDynamicProperty("data", JSON.stringify(data.perm));
	}

	static delete(player) {
		if (typeof player === "string") this.cache.delete(player);
		if (isRealPlayer(player)) this.cache.delete(player.name);
	}

	static remove(player) {
		this.save(player);
		this.delete(player);
	}
}