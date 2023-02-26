// Items list
const FLASHLIGHT = "Weak flashlight";
const STRONG_FLASHLIGHT = "Strong flashlight"
const EMF = "EMF";
const SPIRIT_BOX = "Spirit box";
const WRITING = "Ghost writing book";
const UV_FLASHLIGHT = "UV flashlight";
const VIDEO_CAMERA = "Video camera";
const PHOTO_CAMERA = "Photo camera";
const DOTS = "D.O.T.S. projector";
const CANDLE = "Candle";
const CRUCIFIX = "Crucifix";
const UV_GLOWSTICK = "Glowstick";
const HEAD_CAMERA = "Head mounted camera";
const LIGHTER = "Lighter";
const MOTION_SENSOR = "Motion sensor";
const PARABOLIC_MICROPHONE = "Parabolic microphone";
const SALT = "Salt";
const SANITY_PILL = "Sanity pill";
const SMUDGE_STICK = "Smudge stick";
const SOUND_SENSOR = "Sound sensor";
const THERMOMETER = "Thermometer";
const TRIPOD = "Tripod";

// const FULL = [ EMF, EMF, FLASHLIGHT, FLASHLIGHT, FLASHLIGHT, FLASHLIGHT, STRONG_FLASHLIGHT, STRONG_FLASHLIGHT, STRONG_FLASHLIGHT, STRONG_FLASHLIGHT, SPIRIT_BOX, SPIRIT_BOX, WRITING, WRITING, UV_GLOWSTICK, UV_GLOWSTICK, UV_FLASHLIGHT, UV_FLASHLIGHT, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, PHOTO_CAMERA, PHOTO_CAMERA, PHOTO_CAMERA, DOTS, DOTS, CANDLE, CANDLE, CANDLE, CANDLE, CRUCIFIX, CRUCIFIX, HEAD_CAMERA, HEAD_CAMERA, HEAD_CAMERA, HEAD_CAMERA, LIGHTER, LIGHTER, LIGHTER, LIGHTER, MOTION_SENSOR, MOTION_SENSOR, MOTION_SENSOR, MOTION_SENSOR, PARABOLIC_MICROPHONE, PARABOLIC_MICROPHONE, SALT, SALT, SALT, SANITY_PILL, SANITY_PILL, SANITY_PILL, SANITY_PILL, SMUDGE_STICK, SMUDGE_STICK, SMUDGE_STICK, SMUDGE_STICK, SOUND_SENSOR, SOUND_SENSOR, SOUND_SENSOR, SOUND_SENSOR, TRIPOD, TRIPOD, TRIPOD, TRIPOD, TRIPOD, THERMOMETER, THERMOMETER, THERMOMETER ];
const ALL = [ EMF, FLASHLIGHT, STRONG_FLASHLIGHT, SPIRIT_BOX, WRITING, UV_GLOWSTICK, UV_FLASHLIGHT, VIDEO_CAMERA, PHOTO_CAMERA, DOTS, CANDLE, CRUCIFIX, HEAD_CAMERA, LIGHTER, MOTION_SENSOR, PARABOLIC_MICROPHONE, SALT, SANITY_PILL, SMUDGE_STICK, SOUND_SENSOR, TRIPOD, THERMOMETER ];
const STARTER = [EMF, FLASHLIGHT, UV_FLASHLIGHT, DOTS, WRITING, SPIRIT_BOX, VIDEO_CAMERA, THERMOMETER];

// Specials
const NO_SPECIAL = -1; // also used for columnize() if no special indices are preferred
const SPECIAL_RANDOM = 0;
const SPECIAL_REMOVER = 1;
const SPECIAL_RANDOM_LIST = [NO_SPECIAL, SPECIAL_REMOVER];

// Options indices
const NAME = 0;
const RANDOM = 1;
const START = 2;
const POSSIBLE = 3;
const SPECIAL = 4;

// format: [name, starting rolls, starting items, possible items, specials]
let options = [
    ["evidence-rolls", 4, [], ALL, NO_SPECIAL],
    ["normal", 0, STARTER, ALL, NO_SPECIAL],
    ["test", 8, [], ALL, SPECIAL_REMOVER],
    ["empty", 0, [], [], NO_SPECIAL],
    ["remover", 0, ALL, [], SPECIAL_REMOVER],
];

const VIEW_COLUMNS = 1;
let list = [];
let possible = [];
let removed = [];
let selected = 0;
let lastRolls = 0;
const RANDOM_CHANCE = 10;
const accidentMessages = ["Oops, i might have scrambled some lists... ;P", "Did you check your current item list? ;P", "I think i shuffled some of the values, not sure how that happened -_-", "Are you proud of me mom? xD"];
const BASE_OPTIONS_LENGTH = options.length;
const randomizedMessages = ["Is this truly random?", "This might be random, or is there a trick to it?", "Could it be?"];
const hex = "0123456789abcdef";

// Command info
const prefix = "!";
const color = "#623270";
const help = [ [prefix + "help", "Displays all the available commands", false],
               [prefix + "options", "Displays all the randomizer options", false],
               [prefix + "view [option]", "displays the settings for an option", false],
               [prefix + "select <option>", "Displays all the randomizer options", false],
               [prefix + "roll [count]", "Rolls to add a random item, if a [count] is given it will do so for [count] times", false],
               [prefix + "possible", "Shows the items possible to roll", false],
               [prefix + "random", "May or may not do something...", false],
               [prefix + "reset", "Resets the current list back to the defaults of the selected option", false] ];

// Setup discord bot
let allowedServers = [1070068557045567588, 943224828897394719];
let allowedChannels = [1077663699801739385, 1071683421354602617];
let allowedRoles = ["Admin", "Dev", "Ghost hunter"];
const needsRoles = true;
const tempAdd = false;
const leaveIfUnverified = false;
const token = "MTA3MDA2NzQ3MDkzNDc0NTEyOA.GwsRq4.-DcB4KJ66BhzpO2iIF2Vv5dfQ76fgjgK1ITVI0";
const { Client, Events, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, () => { console.log("Phasmo randomizer bot is online!"); console.log(client.options.intents); selectId(0, null); client.user.setPresence({ activities: [{ name: "chat for " + prefix + "help", type: ActivityType.Watching }], status: "" }); });
client.login(token).catch(err => { console.log(err); });

client.on(Events.MessageCreate, (message) => {
    if (message.inGuild()) {
        if (message.content === prefix + "verify add YO" && tempAdd) { allowedServers.push(message.guild.id); }
        for (let i = 0; i < allowedServers.length; i++) { if (allowedServers[i] == message.guild.id) { onMessage(message.author, message.content, message); return; } }
        console.log("Unknown Guild: message received! message: " + message.content + "\nGuild id: " + message.guild.id);
        if (leaveIfUnverified) { message.guild.leave().then( ()=> { console.log("Left guild!"); }, () => { console.log("Failed to leave guild!"); } ); }
    }
    message.channel.send(message.author, "This bot only works in authorized servers!");
});

function onMessage(author, message, rawMessage) {
    if (author.id !== client.user.id) {
        console.log("Authorized Guild: message received! message: " + message);
        if (message.startsWith(prefix)) { onCommand(author, message.substring(prefix.length, message.length).split(" "), rawMessage); }
    }
}

function onCommand(author, args, rawMessage) {
    const channel = rawMessage.channel;
    console.log("command triggered! Channel id: " + channel.id);
    if (!contains(allowedChannels, channel.id)) { return; }

    // check if user has the right permissions
    const member = rawMessage.guild.members.cache.get(author.id);
    if (!member.roles.cache.some((role) => { return contains(allowedRoles, role.name); })) { if (needsRoles) { sendMessage(channel, "Missing permissions", "You do not have the required permissions to use commands on this bot!"); return; } }

    // Execute command
    channel.sendTyping().then(() => {
        switch (args[0]) {
            case "help": sendEmbed(channel, "-=> Help <=-","<> are required, [] are optional", color, help); break;
            case "options": viewOptions(channel); break;
            case "view":
                if (args.length < 2) { viewId(selected, channel); } else { if (!viewName(args[1], channel)) { sendMessage(channel, "Invalid argument", "No option with that name found, see '" + prefix + "options' for all the options"); } }
                break;
            case "select":
                if (args.length < 2) { sendMessage(channel, "Not enough arguments", "(" + args.length + "/2) of the required arguments given");
                } else if (!selectByName(args[1], channel)) { sendMessage(channel, "Invalid argument", "No option with that name found, see '" + prefix + "options' for all the options"); }
                break;
            case "roll":
                if (args.length < 2) { roll(1, channel, false);
                } else if (!roll(args[1], channel, false)) { sendMessage(channel, "Invalid argument", "Please enter a number as an argument"); }
                break;
            case "reset": selectId(selected, channel); lastRolls = 0; break;
            case "possible": viewPossible(channel); break;
            case "random": randomAction(channel); break;
            case "verify":
                if (args[1] === "add" && args[2] === "YO") { sendMessage(channel, "Verify request has been sent", "Bot will not remove itself during this session, bot creator should add it to the bot soon");
                } else { sendMessage(channel, "Unknown command '" + args[0] + "'", "Use '" + prefix + "help' to see all the available commands"); } break;
            default: sendMessage(channel, "Unknown command '" + args[0] + "'", "Use '" + prefix + "help' to see all the available commands"); break;
        }
    });
}

function find(name) { for (let i = 0; i < options.length; i++) { if (options[i][0] === name) { return i; } } return -1; }

function random(min, max) { return Math.floor(min + (Math.random() * (max - min + 1))); }

function chance(percentage) { return random(0, 99) < percentage; }

function roll(count, channel, start) {
    if (options[selected][SPECIAL] === SPECIAL_REMOVER && !start) {
        // remove
        possible = [];
        removed = [];
        lastRolls = 0;
        const l = Math.max(list.length - count, 0);
        while (list.length > l) {
            let r = random(0, list.length - 1);
            removed.push(list[r]);
            let tmp = [];
            for (let i = 0; i < list.length; i++) { if (i !== r) { tmp.push(list[i]); } }
            list = [];
            for (let i = 0; i < tmp.length; i++) { if (!contains(list, tmp[i])) { list.push(tmp[i]); } }
        }
        console.log("removing");
        viewCurrent(channel);
    } else {
        // add
        if (isNaN(count)) { return false; }
        count = Math.floor(count);
        calcPossible();
        if (possible.length < 1) { viewCurrent(channel); return true; }
        if (count < 1) { count = 1; } else if (count > possible.length) { count = possible.length; }
        lastRolls = count;
        for (let i = 0; i < count; i++) {
            list.push(possible[random(0, possible.length - 1)]);
            calcPossible();
        }
        viewCurrent(channel);
    }
    return true;
}

function calcPossible() {
    possible = [];
    let remove = [];
    for (let i = 0; i < options[selected][POSSIBLE].length; i++) { possible.push(options[selected][POSSIBLE][i]); }
    for (let i = 0; i < list.length; i++) { remove.push(list[i]); }
    for (let i = 0; i < remove.length; i++) {
        const t = possible.indexOf(remove[i]);
        if (t > -1) { possible.splice(t, 1); }
    }
}

function viewCurrent(channel) {
    const lists = columnize(list, VIEW_COLUMNS, list.length - 1 - lastRolls);
    let fields = [];
    for (let i = 0; i < Math.min(list.length, VIEW_COLUMNS); i++) { fields.push([(i === 0 ? "Items" : "."), lists[i], true]); }
    if (list.length < 1) { fields.push(["Items", "No items", false]); }
    fields.push(["Possible", possible.length + " items", false]);
    if (removed.length > 0) {
        const removes = columnize(removed, VIEW_COLUMNS, NO_SPECIAL);
        for (let i = 0; i < Math.min(removed.length, VIEW_COLUMNS); i++) { fields.push([(i === 0 ? "Removed" : "."), removes[i], true]); }
    }
    if (channel != null) { sendEmbed(channel, "Current items", "Preset: " + options[selected][NAME], color, fields); }
}

function viewPossible(channel) {
    const tmpPossible = columnize(possible, VIEW_COLUMNS, NO_SPECIAL);
    let fields = [];
    for (let i = 0; i < Math.min(possible.length, VIEW_COLUMNS); i++) { fields.push([(i === 0 ? "Possible" : "."), tmpPossible[i], true]); }
    if (possible.length < 1) { fields.push(["Possible", "No possible items", false]); }
    if (channel != null) { sendEmbed(channel, "Items to roll for", "Preset: " + options[selected][NAME], color, fields); }
}

function viewOptions(channel) {
    let fields = [];
    for (let i = 0 ; i < options.length; i++) { fields.push([options[i][NAME], options[i][RANDOM] + " random items, " + options[i][START].length + " set items and "+  options[i][POSSIBLE].length + " items to roll for." + (options[i][SPECIAL] === SPECIAL_REMOVER ? "\nWill remove items on roll after starting" : ""), true]); }
    sendEmbed(channel, "Options", "A list of all the available setups", color, fields);
}

function viewName(name, channel) { const i = find(name); if (i > -1) { viewId(i, channel); return true; } return false; }

function viewId(i, channel) {
    if (i < 0 || i >= options.length) { if (i < 0 || i >= options.length) { sendMessage(channel, "ERROR", "Option id out of range, nothing has been selected!"); return; } }
    const items = columnize(options[i][START], VIEW_COLUMNS, NO_SPECIAL);
    let fields = [["Info", options[i][RANDOM] > 1 ? "This setup has " + options[i][START] + " more items on top of the starter items, rolled from the list of possibilities" : (options[i][START] === 1 ? "This setup has 1 more item on top of the starter items, rolled from the list of possibilities" : "This setup has no random items added"), false]];
    if (options[i][START].length > 0) { for (let j = 0; j < Math.min(VIEW_COLUMNS, options[i][START].length); j++) { fields.push([(j === 0 ? "Starter items:" : "."), items[j], true]); } }
    if (options[i][START].length < 1) { fields.push(["Starter items:", "No standard starter items", false]); }
    const posItems = columnize(options[i][POSSIBLE], VIEW_COLUMNS, NO_SPECIAL);
    if (options[i][POSSIBLE].length > 0) { for (let j = 0; j < Math.min(VIEW_COLUMNS, options[i][POSSIBLE].length); j++) { fields.push([(j === 0 ? "Possible roll-able items:" : "."), posItems[j], true]); } }
    if (options[i][POSSIBLE].length < 1) { fields.push(["Possible roll-able items:", "No possible items", false]); }
    if (channel != null) { sendEmbed(channel, options[i][NAME], (i === selected ? "Selected" : "Showing") +" option: " + options[i][NAME], color, fields); }
}

function selectId(i, channel) {
    // Check if option exists
    if (i < 0 || i >= options.length) { sendMessage(channel, "ERROR", "Option id out of range, nothing has been selected!"); return; }

    // Reset the lists
    selected = i;
    list = [];
    removed = [];
    for (let i = 0; i < options[selected][START].length; i++) { list.push(options[selected][START][i]); }
    calcPossible();
    if (options[selected][RANDOM] > 0) { roll(options[selected][RANDOM], channel, true); } else { lastRolls = 0; viewCurrent(channel); }
}

function selectByName(name, channel) { const i = find(name); if (i > -1) { selectId(i, channel); return true; } return false; }

function sendMessage(channel, title, message) { if (channel != null) {sendEmbed(channel, title, message, color, []); } else { console.log(title + ": " + message); } }

function sendEmbed(channel, title, description, col, fields) {
    let embed = new EmbedBuilder().setTitle(title).setColor(col).setDescription(description);
    for (let i = 0; i < fields.length; i++) { embed.addFields({ name: fields[i][0], value: fields[i][1], inline: fields[i][2] }); }
    channel.send({ embeds: [embed] });
}

// function sleep(ms) { return new Promise((resolve) => { setTimeout(resolve, ms); }); }

function contains(array, value) { for (let i = 0; i < array.length; i++) { if (array[i] == value) { return true; } } return false; }

function randomAction(channel) {
    if (chance(RANDOM_CHANCE)) {
        // Set up possible items
        let pos = [];
        for (let i = 0; i < ALL.length; i++) { pos.push(ALL[i]); }

        // Add a random amount of base items
        const r = random(2, ALL.length / 2);
        let it = [];
        while (it.length < r) {
            let a = random(0, pos.length - 1);
            if (!contains(it, pos[a])) { it.push(pos[a]); }
        }

        // Set random items on select
        const d = random(0, 3);

        // Add the randomized preset to the options
        const name = "Random-" + (options.length - BASE_OPTIONS_LENGTH + 1);
        options.push([name, d, it, pos]);

        // LET THE RANDOM COMMENCE
        if (!selectByName(name, channel)) { sendMessage(channel, "Randomizer error", "Something went wrong trying to make a random funny thing, this shouldn't happen again once it gets fixed!"); return; }
        randomMessage(channel, accidentMessages);
        return;
    }
    randomMessage(channel, randomizedMessages);
}

function randomMessage(channel, list) {
    let c = "#";
    for (let i = 0; i < 6; i++) { c += hex[random(0, hex.length -1)]; }
    sendEmbed(channel, "Random?", list[random(0, list.length - 1)], c, []);
}

function columnize(array, columns, minSpecial) {
    let tmp = [];
    minSpecial = (minSpecial < 0 ? array.length : minSpecial);
    for (let i = 0; i < columns; i++) { tmp.push(""); } // Set up list as string type
    for (let i = 0; i < array.length; i++) { tmp[i % columns] += (i > minSpecial ? "> ***" : "") + array[i] + (i > minSpecial ? "***" : "") +"\n" }
    return tmp;
}