import { world, system } from "@minecraft/server";
import { isRealPlayer, Basic, Display } from "./lib.js";

system.beforeEvents.startup.subscribe(event => {
	event.customCommandRegistry.registerCommand({
		name: "star:info",
		description: "Get player environment info",
		cheatsRequired: false,
		optionalParameters: [{
			name: "Player",
			type: "PlayerSelector"
		}],
		permissionLevel: 2
	},
	(origin, players) => {
		const caller = origin.sourceEntity;
		if (!isRealPlayer(caller)) return {
			status: 1,
			message: "This command must be run by a player"
		};

		if (!players) players = [ caller ];
		if (players.length !== 1) return {
			status: 1,
			message: "This command only allows one player argument"
		};
		const player = players[0];

		if (!isRealPlayer(player)) return {
			status: 1,
			message: "Invalid Player"
		};

		system.run(() => {
			caller.sendMessage(`§f// * §bPlayer Info §f* //`);
			caller.sendMessage(`§l§6◆ §r§fBasic Info`);
			caller.sendMessage(`§e# §fAccount: §i${player.name}`);
			caller.sendMessage(`§e# §fName Tag: §i${player.nameTag}`);
			caller.sendMessage(`§e# §fLanguage: §i${player.clientSystemInfo.locale}`);
			caller.sendMessage(`§e# §fPing: §i${player.getPing()}`);
			caller.sendMessage(`§e# §fPermission: §i${player.playerPermissionLevel}`);
			caller.sendMessage(`§l§6◆ §r§fDevice Info`);
			caller.sendMessage(`§e# §fDevice: §i${player.clientSystemInfo.platformType}`);
			caller.sendMessage(`§e# §fMemory: §i${Display.formatMemoryTier(player.clientSystemInfo.memoryTier)}`);
			caller.sendMessage(`§e# §fInput: §i${player.inputInfo.lastInputModeUsed}`);
			caller.sendMessage(`§e# §fGraphics: §i${player.graphicsMode}`);
			caller.sendMessage(`§e# §fRender: §i${player.clientSystemInfo.maxRenderDistance}`);
			caller.sendMessage(`§l§6◆ §r§fDev Info`);
			caller.sendMessage(`§e# §fID: §i${player.id}`);
			caller.sendMessage(`§e# §fPID: §i${player.persistentId}`);
		});
	});

	event.customCommandRegistry.registerCommand({
		name: "star:ping",
		description: "Get player ping info",
		cheatsRequired: false,
		optionalParameters: [{
			name: "Target",
			type: "PlayerSelector"
		}],
		permissionLevel: 0
	},
	(origin, players) => {
		const caller = origin.sourceEntity;

		if (!isRealPlayer(caller)) return {
			status: 1,
			message: "This command must be run by a player"
		};

		if (!players) players = [caller];

		caller.sendMessage(`§f// * §6Ping Info §f* //`);

		system.run(() => {
			players.forEach(player => {
				if (!isRealPlayer(player)) return;
				const ping = player.getPing();
				const pingColor = Display.getPingColor(ping);

				caller.sendMessage(`§e# §f${player.name} -> ${pingColor}${ping}§r`);
			});
		});
	});

	event.customCommandRegistry.registerCommand({
		name: "star:remove",
		description: "Remove specified entities",
		cheatsRequired: false,
		mandatoryParameters: [{
			name: "Entity",
			type: "EntitySelector"
		}],
		permissionLevel: 2
	}, (_, entities) => {
		let entityCount = entities.length;
		let removeCount = 0;
		entities.forEach(entity => {
			if (!isRealPlayer(entity) && entity.isValid) {
				system.run(() => entity.remove());
				removeCount ++;
			}
		});

		if (removeCount === 0) return {
			status: 1,
			message: `Removal failed -> 0 / ${entityCount}`
		}; else if (removeCount < entityCount) return {
			status: 1,
			message: `Partial removal failed -> ${removeCount} / ${entityCount}`
		}; else return {
			status: 0,
			message: `Removal succeeded -> ${removeCount} / ${entityCount}`
		};
	});
});


