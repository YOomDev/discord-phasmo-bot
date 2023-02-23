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

const options = [
    ["evidence-rolls", 4, [], ALL],
    ["normal", 0, STARTER, ALL],
    ["test", 0, [FLASHLIGHT, EMF], ALL],
    ["empty", 0, [], []],
];

const VIEW_COLUMNS = 1;
let list = [];
let possible = [];
let selected = 0;
let lastRolls = 0;
const randomizedMessages = ["Is this truly random?", "This might be random, or is there a trick to it?", "Could it be?"];
const hex = "0123456789abcdef";

// Command info
const prefix = "!";
const color = "#311670";
const help = [ [prefix + "help", "Displays all the available commands", false],
               [prefix + "options", "Displays all the randomizer options", false],
               [prefix + "view [option]", "displays the settings for an option", false],
               [prefix + "select <option>", "Displays all the randomizer options", false],
               [prefix + "roll [count]", "Rolls to add a random item, if a [count] is given it will do so for [count] times", false],
               [prefix + "possible", "Shows the items possible to roll", false],
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
                if (args.length < 2) { roll(1, channel);
                } else if (!roll(args[1], channel)) { sendMessage(channel, "Invalid argument", "Please enter a number as an argument"); }
                break;
            case "reset": selectId(selected, channel); lastRolls = 0; break;
            case "possible": viewPossible(channel); break;
            case "random": randomMessage(channel); break;
            case "verify":
                if (args[1] === "add" && args[2] === "YO") { sendMessage(channel, "Verify request has been sent", "Bot will not remove itself during this session, bot creator should add it to the bot soon");
                } else { sendMessage(channel, "Unknown command '" + args[0] + "'", "Use '" + prefix + "help' to see all the available commands"); } break;
            default: sendMessage(channel, "Unknown command '" + args[0] + "'", "Use '" + prefix + "help' to see all the available commands"); break;
        }
    });
}

function random(min, max) {
    let dif = max - min;
    return Math.floor(min + (Math.random() * (dif + 1)));
}

function roll(count, channel) {
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
    viewCurrent(channel); return true;
}

function calcPossible() {
    possible = []; let remove = [];
    for (let i = 0; i < options[selected][3].length; i++) { possible.push(options[selected][3][i]); }
    for (let i = 0; i < list.length; i++) { remove.push(list[i]); }
    for (let i = 0; i < remove.length; i++) {
        let t = possible.indexOf(remove[i]);
        if (t > -1) { possible.splice(t, 1); }
    }
}

function viewCurrent(channel) {
    let minSpecial = list.length - 1 - lastRolls;
    let lists = ["", "", ""];
    for (let i = 0; i < list.length; i++) { lists[i % VIEW_COLUMNS] += (i > minSpecial ? "> ***" : "") + list[i] + (i > minSpecial ? "***" : "") + "\n"; }
    let fields = [];
    for (let i = 0; i < Math.min(list.length, VIEW_COLUMNS); i++) { fields.push([(i == 0 ? "Items" : " "), lists[i], true]); }
    if (list.length < 1) { fields.push(["Items", "No items", false]); }
    fields.push(["Possible", possible.length + " items", false]);
    if (channel != null) { sendEmbed(channel, "Current items", "Preset: " + options[selected][0], color, fields); }
}

function viewPossible(channel) {
    let tmpPossible = ["", "", ""];
    for (let i = 0; i < possible.length; i++) {
        tmpPossible[i % VIEW_COLUMNS] += possible[i];
        if (i < possible.length - 1) { tmpPossible[i % VIEW_COLUMNS] += "\n"; }
    }
    if (possible.length < 1) { tmpPossible = "No items"; }
    let fields = [["Possible", (possible.length > 0 ? "Possible items are shown below" : "No possible items"), false]];
    for (let i = 0; i < Math.min(possible.length, VIEW_COLUMNS); i++) { fields.push([" ", tmpPossible[i], true]); }
    if (channel != null) { sendEmbed(channel, "Items to roll for", "Preset: " + options[selected][0], color, fields); }
}

function viewOptions(channel) {
    let fields = [];
    for (let i = 0 ; i < options.length; i++) { fields.push([options[i][0], options[i][1] + " random items and " + options[i][2].length + " set items", true]); }
    sendEmbed(channel, "Options", "A list of all the available setups", color, fields);
}

function viewName(name, channel) {
    for (let i = 0; i < options.length; i++) {
        if (options[i][0] === name) {
            viewId(i, channel);
            return true; }
    }
    return false;
}

function viewId(i, channel) {
    if (i < 0 || i >= options.length) { if (i < 0 || i >= options.length) { sendMessage(channel, "ERROR", "Option id out of range, nothing has been selected!"); return; } }
    const random = options[i][1] > 1 ? "This setup has " + options[i][1] + " more items on top of the starter items, rolled from the list of possibilities" : (options[i][1] === 1 ? "This setup has 1 more item on top of the starter items, rolled from the list of possibilities" : "This setup has no random items added");
    let items = ["", "", ""];
    for (let j = 0; j < options[i][2].length; j++) { items[j % VIEW_COLUMNS] += options[i][2][j] + "\n"; }
    let fields = [["Info", random, false], ["Starter items:", options[i][2].length > 0 ? "Items are show below" : "No standard starter items", false]];
    if (options[i][2].length > 0) { for (let j = 0; j < Math.min(VIEW_COLUMNS, options[i][2].length); j++) { fields.push([" ", items[j], true]); } }
    let posItems = ["", "", ""];
    for (let j = 0; j < options[i][3].length; j++) { posItems[j % VIEW_COLUMNS] += options[i][3][j] + "\n"; }
    fields.push(["Possible roll-able items:", options[i][3].length > 0 ? "Items are show below" : "No possible items", false]);
    if (options[i][3].length > 0) { for (let j = 0; j < Math.min(VIEW_COLUMNS, options[i][3].length); j++) { fields.push([" ", posItems[j], true]); } }
    const name = options[i][0];
    if (channel != null) { sendEmbed(channel, name, (i === selected ? "Selected" : "Showing") +" option: " + name, color, fields); }
}

function selectId(i, channel) {
    // Check if option exists
    if (i < 0 || i >= options.length) { sendMessage(channel, "ERROR", "Option id out of range, nothing has been selected!"); return; }

    // Reset the lists
    selected = i;
    list = [];
    for (let i = 0; i < options[selected][2].length; i++) { list.push(options[selected][2][i]); }
    calcPossible();
    if (options[selected][1] > 0) { roll(options[selected][1], channel); } else { viewCurrent(channel); }
}

function selectByName(name, channel) {
    for (let i = 0; i < options.length; i++) {
        if (options[i][0] === name) {
            selectId(i, channel);
            return true;
        }
    }
    return false;
}

function sendMessage(channel, title, message) { if (channel != null) {sendEmbed(channel, title, message, color, []); } else { console.log(title + ": " + message); } }

function sendEmbed(channel, title, description, col, fields) {
    let embed = new EmbedBuilder().setTitle(title).setColor(col).setDescription(description);
    for (let i = 0; i < fields.length; i++) { embed.addFields({ name: fields[i][0], value: fields[i][1], inline: fields[i][2] }); }
    channel.send({ embeds: [embed] });
}

// function sleep(ms) { return new Promise((resolve) => { setTimeout(resolve, ms); }); }

function contains(array, value) { for (let i = 0; i < array.length; i++) { if (array[i] == value) { return true; } } return false; }

function randomMessage(channel) {
    let c = "#";
    for (let i = 0; i < 6; i++) { c += hex[random(0, hex.length -1)]; }
    sendEmbed(channel, "Random?", randomizedMessages[random(0, randomizedMessages.length - 1)], c, []);
}