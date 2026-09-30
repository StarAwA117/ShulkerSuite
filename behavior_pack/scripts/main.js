import { world, system } from "@minecraft/server";
import { beforeEvents } from "@minecraft/server-admin";
import * as config from "./config.js";
import { isRealPlayer, Basic, Display } from "./lib.js";



// Data Init
let features;
// World Start Time
const worldStartTime = Date.now();
// Last Time for TPS
let lastTime = Date.now();
// World TPS
let currentTPS = 20;



// Startup
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
		name: "star:tps",
		description: "Get world TPS data",
		cheatsRequired: false,
		permissionLevel: 0
	},
	(origin) => {
		// Get the command sender
		const caller = origin.sourceEntity;

		// Check whether the command sender is a player
		if (!isRealPlayer(caller)) return {
			status: 1,
			message: "This command must be run by a player"
		};

		// Display TPS string
		const showTPS = currentTPS.toFixed(1);
		caller.sendMessage(`§l§d◆ §r§uTPS: §f${showTPS}`);
	});

	event.customCommandRegistry.registerCommand({
		name: "star:status",
		description: "Show world status",
		cheatsRequired: false,
		optionalParameters: [{
			name: "Player",
			type: "PlayerSelector"
		}],
		permissionLevel: 2
	},
	(origin, players) => {
		const caller = origin.sourceEntity;

		if (!players) {
			if (!caller || caller.typeId !== "minecraft:player") return {
				status: 1,
				message: "No target found to display"
			}

			players = [ caller ];
		}

		// Data collection
		// Get current status
		const status = Display.getWorldStatus(currentTPS);
		// Calculate elapsed runtime
		const runtime = Display.formatMS(Date.now() - worldStartTime);
		// Display TPS string
		const showTPS = currentTPS.toFixed(1);

		system.run(() => {
			// Player count
			const playerCount = world.getPlayers().length;
			// Day count
			const dayCount = world.getDay();
			// World spawn point
			const spawnLocation = world.getDefaultSpawnLocation();

			players.forEach(player => {
				player.sendMessage(`§f// * §aWorld Status §f* //`);
				player.sendMessage(`§l§6◆ §r§fBasic Info`);
				player.sendMessage(`§e# §fStatus: §i${status}`);
				player.sendMessage(`§e# §fRuntime: §i${runtime}`);
				player.sendMessage(`§e# §fPlayers: §i${playerCount}`);
				player.sendMessage(`§e# §fTPS: §i${showTPS}`);
				player.sendMessage(`§l§6◆ §r§fWorld Info`);
				player.sendMessage(`§e# §fDays: §i${dayCount}`);
				player.sendMessage(`§e# §fSeed: §i${world.seed}`);
				player.sendMessage(`§e# §fTick: §i${system.currentTick}`);
				player.sendMessage(`§e# §fSpawn: §i( ${spawnLocation.x}, ${spawnLocation.y}, ${spawnLocation.z} )`);
				player.sendMessage(`§e# §fisEditor: §i${system.isEditorWorld}`);
				player.sendMessage(`§l§6◆ §r§fDev Info`);
				player.sendMessage(`§e# §fMemory: §i${Display.formatMemoryTier(system.serverSystemInfo.memoryTier)}`);
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

	event.customCommandRegistry.registerEnum("star:feature_keys", Object.keys(config.features));

	event.customCommandRegistry.registerCommand({
		name: "star:feature",
		description: "Look or set feature toggle",
		cheatsRequired: false,
		mandatoryParameters: [
			{
				name: "Feature",
				enumName: "star:feature_keys",
				type: "Enum"
			}
		],
		optionalParameters: [
			{
				name: "Toggle",
				type: "Boolean"
			}
		],
		permissionLevel: 3
	}, (_, feature, toggle) => {
		if (Basic.isEmpty(toggle)) {
			world.sendMessage(`§l§d◆ §r§f${feature}: ${features[feature]}`);

			return {
				status: 0,
				message: `Succeed in Showing Feature State`
			};
		}

		features[feature] = toggle;

		world.setDynamicProperty("features_config", JSON.stringify(features));

		return {
			status: 0,
			message: `Succeed in Setting ${feature} to ${toggle}`
		};
	});
});



system.runTimeout(async () => {
	// Check before Join
	beforeEvents.asyncPlayerJoin.subscribe((event) => {
		const name = event.name;
		const pid = event.persistentId;

		// Invalid PID
		if (pid.replaceAll(" ", "") == "") {
			event.disconnect(`BLOCK: Can't find your pid`);
			console.warn(`BLOCK: Can't find pid \nName: ${name} PID: ${pid}`);
			return false;
		}

		// Invalid Name
		if (event.name.length < 4 || event.name.length > 31 || /[^a-zA-Z0-9\s_-]/.test(event.name)) {
			event.disconnect(`BLOCK: Invalid name`);
			console.warn(`BLOCK: Invalid name\nName: ${name} PID: ${pid}`);
			return false;
		}

		// Server Entrance Closed
		if (!features.server_entrance) {
			event.disconnect(`BLOCK: The server entrance has closed`);
			console.warn(`BLOCK: A player can't join because of the server entrance\nName: ${name} PID: ${pid}`);
		}

		// Allow Join
		event.allowJoin();

		// Message
		console.warn(`BLOCK: Player[${name}] will Join the world`);
	});
}, 100);



// Interval
// 20 tick = 1 s
system.runInterval(() => {
	// Compute World TPS
	const now = Date.now();
	currentTPS = 20 / ((now - lastTime) / 1000);
	if (currentTPS >= 20) currentTPS = 20;
	lastTime = now;
});



// Init
system.run(() => {
	// Get World Config
	const features_json = world.getDynamicProperty("features_config");
	features = features_json ? JSON.parse(features_json) : {};

	// Assign
	features = { ...config.features, ...features };

	// Set World Config
	world.setDynamicProperty("features_config", JSON.stringify(features));

	// Message
	world.sendMessage("§l§d◆ §r§fLoad");
});