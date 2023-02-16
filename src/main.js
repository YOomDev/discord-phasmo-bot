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

const FULL = [ EMF, EMF, FLASHLIGHT, FLASHLIGHT, FLASHLIGHT, FLASHLIGHT, STRONG_FLASHLIGHT, STRONG_FLASHLIGHT, STRONG_FLASHLIGHT, STRONG_FLASHLIGHT, SPIRIT_BOX, SPIRIT_BOX, WRITING, WRITING, UV_GLOWSTICK, UV_GLOWSTICK, UV_FLASHLIGHT, UV_FLASHLIGHT, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, VIDEO_CAMERA, PHOTO_CAMERA, PHOTO_CAMERA, PHOTO_CAMERA, DOTS, DOTS, CANDLE, CANDLE, CANDLE, CANDLE, CRUCIFIX, CRUCIFIX, HEAD_CAMERA, HEAD_CAMERA, HEAD_CAMERA, HEAD_CAMERA, LIGHTER, LIGHTER, LIGHTER, LIGHTER, MOTION_SENSOR, MOTION_SENSOR, MOTION_SENSOR, MOTION_SENSOR, PARABOLIC_MICROPHONE, PARABOLIC_MICROPHONE, SALT, SALT, SALT, SANITY_PILL, SANITY_PILL, SANITY_PILL, SANITY_PILL, SMUDGE_STICK, SMUDGE_STICK, SMUDGE_STICK, SMUDGE_STICK, SOUND_SENSOR, SOUND_SENSOR, SOUND_SENSOR, SOUND_SENSOR, TRIPOD, TRIPOD, TRIPOD, TRIPOD, TRIPOD, THERMOMETER, THERMOMETER, THERMOMETER ];
const ALL = [ EMF, FLASHLIGHT, STRONG_FLASHLIGHT, SPIRIT_BOX, WRITING, UV_GLOWSTICK, UV_FLASHLIGHT, VIDEO_CAMERA, PHOTO_CAMERA, DOTS, CANDLE, CRUCIFIX, HEAD_CAMERA, LIGHTER, MOTION_SENSOR, PARABOLIC_MICROPHONE, SALT, SANITY_PILL, SMUDGE_STICK, SOUND_SENSOR, TRIPOD, THERMOMETER ];
const NO_FLASH_LIGHTS = [ EMF, SPIRIT_BOX, WRITING, UV_GLOWSTICK, VIDEO_CAMERA, PHOTO_CAMERA, DOTS, CANDLE, CRUCIFIX, HEAD_CAMERA, LIGHTER, MOTION_SENSOR, PARABOLIC_MICROPHONE, SALT, SANITY_PILL, SMUDGE_STICK, SOUND_SENSOR, TRIPOD, THERMOMETER ];

const options = [
    ["dark", 1, [EMF], NO_FLASH_LIGHTS],
    ["one-per-evidence", 1, [], ALL],
    ["OPE-but-harder", 1, [], FULL],
    ["cameras", 0, [VIDEO_CAMERA, PHOTO_CAMERA, HEAD_CAMERA], []],
    ["no-evidence", 0, [PHOTO_CAMERA, SALT, FLASHLIGHT, STRONG_FLASHLIGHT, CANDLE, CRUCIFIX, LIGHTER, MOTION_SENSOR, SOUND_SENSOR, PARABOLIC_MICROPHONE, SANITY_PILL, SMUDGE_STICK, TRIPOD], []]
];
let list = [];
let possible = [];
let selected = 0;

// Command info
const prefix = "!";
const color = "#777777";
const help = [ [prefix + "help", "Displays all the available commands", false],
               [prefix + "options", "Displays all the randomizer options", false],
               [prefix + "view [option]", "displays the settings for an option", false],
               [prefix + "select <option>", "Displays all the randomizer options", false],
               [prefix + "roll [count]", "Rolls to add a random item, if a [count] is given it will do so for [count] times", false],
               [prefix + "possible", "Shows the items possible to roll", false],
               [prefix + "reset", "Resets the current list back to the defaults of the selected option", false] ];

// Setup discord bot
let allowedServers = [1070068557045567588];
const tempAdd = true;
const leaveIfUnverified = false;
// const id = 1070067470934745128;
const token = "MTA3MDA2NzQ3MDkzNDc0NTEyOA.GwsRq4.-DcB4KJ66BhzpO2iIF2Vv5dfQ76fgjgK1ITVI0";
const { Client, Events, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, () => { console.log("Phasmo bot is online!"); console.log(client.options.intents); selectId(0, null); client.user.setPresence({ activities: [{ name: "chat for " + prefix + "help", type: ActivityType.Watching }], status: "" }); });
client.login(token);

client.on(Events.MessageCreate, (message) => {
    if (message.inGuild()) {
        if (message.content == prefix + "verify add YO" && tempAdd) { allowedServers.push(message.guild.id); }
        for (let i = 0; i < allowedServers.length; i++) {
            if (allowedServers[i] == message.guild.id) { onMessage(message.author, message.content, message); return; }
        }
        console.log("Unknown Guild: message received! message: " + message.content);
        console.log("Guild id: " + message.guild.id);
        if (leaveIfUnverified) { message.guild.leave().then( ()=> { console.log("Left guild!"); }, () => { console.log("Failed to leave guild!"); } ); }
    }
    client.message.send(message.author, "This bot only works in authorized servers!");
});

function onMessage(author, message, rawMessage) {
    if (author.id !== client.user.id) {
        console.log("Authorized Guild: message received! message:");
        console.log(message);
        // Commands
        if (message.startsWith(prefix)) {
            console.log("command triggered");
            onCommand(author, message.substring(prefix.length, message.length).split(" "), rawMessage);
        }
    }
}

function onCommand(author, args, rawMessage) {
    const channel = rawMessage.channel;
    channel.sendTyping();
    switch (args[0]) {
        case "help": sendEmbed(channel, "-=> Help <=-","<> are required, [] are optional", color, help); break;
        case "options": viewOptions(channel); break;
        case "view":
            if (args.length < 2) { viewId(selected, channel); } else { if (!viewName(args[1], channel)) { channel.send("No option with that name found, see '" + prefix + "options' for all the options"); } }
            break;
        case "select":
            if (args.length < 2) { channel.send("Not enough arguments given! (" + args.length + "/2)");
            } else if (!selectByName(args[1], channel)) { channel.send("No option with that name found, see '" + prefix + "options' for all the options"); }
            break;
        case "roll":
            if (args.length < 2) { roll(1, channel);
            } else if (!roll(args[1], channel)) { channel.send("Please enter a number as an argument"); }
            break;
        case "reset": selectId(selected, channel); break;
        case "possible": viewPossible(channel); break;
        case "verify": if (args[1] == "add" && args[2] == "YO") { channel.send("Added a verify request, bot will not remove itself during this session, bot creator should add it to the bot soon"); } else { channel.send("Unknown command '" + args[0] + "', Use '" + prefix + "help' to see all the available commands"); } break
        default: channel.send("Unknown command '" + args[0] + "', Use '" + prefix + "help' to see all the available commands"); break;
    }
}

function roll(count, channel) {
    if (isNaN(count)) { return false; }
    count = Math.floor(count);
    calcPossible();
    if (possible.length < 1) { viewCurrent(channel); return true; }
    if (count < 1) { count = 1; } else if (count > possible.length) { count = possible.length; }
    for (let i = 0; i < count; i++) {
        list.push(possible[Math.floor(Math.random() * possible.length)]);
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
    let tmpList = "";
    for (let i = 0; i < list.length; i++) {
        tmpList += list[i]
        if (i < list.length - 1) { tmpList += "\n"; }
    }
    if (list.length < 1) { tmpList = "No items"; }
    if (channel != null) { sendEmbed(channel, "Current items", "Preset: " + options[selected][0], color, [["Items", tmpList, true], ["Possible", possible.length + " items", true]]); }
}

function viewPossible(channel) {
    let tmpPossible = "";
    for (let i = 0; i < possible.length; i++) {
        tmpPossible += possible[i];
        if (i < possible.length - 1) { tmpPossible += "\n"; }
    }
    if (possible.length < 1) { tmpPossible = "No items"; }
    if (channel != null) { sendEmbed(channel, "Items to roll for", "Preset: " + options[selected][0], color, [["Possible", tmpPossible, false]]); }
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
    if (i < 0 || i >= options.length) {
        if (channel != null) { channel.send("ERROR: Option id out of range, nothing could be viewed!");
        } else { console.log("ERROR: Option id out of range, nothing could be viewed!"); }
        return;
    }
    const random = options[i][1] > 1 ? "This setup has " + options[i][1] + " more items on top of the starter items, rolled from the list of possibilities" : (options[i][1] === 1 ? "This setup has 1 more item on top of the starter items, rolled from the list of possibilities" : "This setup has no random items added");
    let fields = [["Info", random, false], ["Starter items:", options[i][2].length > 0 ? "items are shown below" : "No standard starter items", false]];
    for (let j = 0; j < options[i][2].length; j++) { fields.push([options[i][2][j], ".", true]); }
    fields.push(["Possible roll-able items:", options[i][3].length > 0 ? "items are shown below" : "No possible items", false]);
    for (let j = 0; j < options[i][3].length; j++) { fields.push([options[i][3][j], ".", true]); }
    const name = options[i][0];
    if (channel != null) { sendEmbed(channel, name, (i === selected ? "Selected" : "Showing") +" option: " + name, color, fields); }
}

function selectId(i, channel) {
    if (i < 0 || i >= options.length) {
        if (channel != null) { channel.send("ERROR: Option id out of range, nothing has been selected!");
        } else { console.log("ERROR: Option id out of range, nothing has been selected!"); }
        return;
    }
    selected = i;

    // Reset the lists
    list = [];
    for (let i = 0; i < options[selected][2].length; i++) { list.push(options[selected][2][i]); }
    calcPossible();
    if (options[selected][1] > 0) { roll(options[selected][1], channel); } else { viewCurrent(channel); }
}

function selectByName(name, channel) {
    for (let i = 0; i < options.length; i++) {
        if (options[i][0] === name) {
            selectId(i, channel); return true;
        }
    }
    return false;
}

function sendEmbed(channel, title, description, col, fields) {
    let embed = new EmbedBuilder().setTitle(title).setColor(col).setDescription(description);
    for (let i = 0; i < fields.length; i++) { embed.addFields({ name: fields[i][0], value: fields[i][1], inline: fields[i][2] }); }
    channel.send({embeds: [embed]});
}