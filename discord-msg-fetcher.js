// returns false in the case `condition` isn't met and prints out `message`
function checkConstraint(condition, channel, message) {
    if (!condition) {
        channel.send(message);
        return false;
    }

    else return true;
}

// returns users array  {
function retrieveMentionedUsers(message) {
    
    let found = [];
    message.mentions.users.forEach(user => found.push(user));
    return found;
    // guild.members.forEach(member => {
    //     console.log(member.user.username);
    // });
}

async function getUserChannelMessages(user, channel) {

    let userMessages = [], 
        pivotId = channel.lastMessageID, 
        isLastChunk = false;
    const fetchLimit = 100;

    while (!isLastChunk) {

        let queryResult = [];
        const promised = await channel.fetchMessages(
            { limit: fetchLimit, before: pivotId });

        promised.forEach(msg => queryResult.push(msg));
        const fetchedNum = queryResult.length;
        if (fetchedNum != fetchLimit) {
            if (fetchedNum == 0) { 
                break; 
            } else {
                isLastChunk = true;
            }
        }

        pivotId = queryResult[fetchedNum - 1].id;
        userMessages = userMessages.concat(
            queryResult.filter(msg => msg.author === user));
    }

    return userMessages;
}

function getRandomInt(from, to) {

    const delta = to - from;
    if (delta < 0) {
        console.log("getRandomInt: improper args -- `to` must " + 
            "be greater than `from`.");
        return -1;
    }
    return Math.floor(Math.random()*delta + from);
}

function replaceSigns(wordArray) {

    let refined = [];
    wordArray.forEach(word => {
        const signFreeWords = word.replace(/[!\?,\.;:'"\(\)-/]/g, ' ')
            .trim().split(/\s+/);
        signFreeWords.forEach(sfw => {
            if (sfw !== '') { refined.push(sfw); }
        });
    });
    return refined;
}

function collectWords(messages) {

    let totalWordNum = 0, 
        dict = new Map();

    messages.forEach(msg => {
        const refined = replaceSigns(msg.content.split(/\s+/));
        refined.forEach(word => {

            const generalized = word.toLowerCase();
            totalWordNum++;
            if (value = dict.get(generalized)) {
                dict.set(generalized, value+1);
            } else {
                dict.set(generalized, 1);
            }
        });
    });

    return dict.size;
}

/////////////////////////////////////////////////////////////////////

const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const activities = [
    ['RoF\'s pigeon memes', 'WATCHING'], 
    ['Game of Thrones', 'PLAYING'], 
    ['Phase\'s C:\\ drive', 'WATCHING'], 
    ['kost\'s tracks', 'LISTENING'], 
    ['Escape from Tarkov', 'PLAYING'], 
    ['MORDHAU', 'PLAYING'], 
    ['Garry\'s Mod', 'PLAYING'], 
    ['Counter-Strike', 'PLAYING'], 
    ['kost\'s tea party', 'STREAMING'], 
    ['PULSAR: Lost Colony', 'PLAYING']
];

client.once('ready', () => {

    console.log('Bot is ready');
    const chosen = activities[getRandomInt(0, activities.length)];
    client.user.setActivity(chosen[0], {type: chosen[1]});
});

client.on('message', message => {

    const stream = message.channel;
    const tokens = message.content.split(/\s+/);

    // ignore any messages from bots (including itself)
    if (message.author.bot || !tokens[0].startsWith(config.prefix)) {
        return;
    }

    switch (tokens[0]) {
        case `${config.prefix}hello`:
            stream.send('Hi there!');
            break;

        case `${config.prefix}say`:

            if (!checkConstraint(tokens.length > 1, stream, 
                'What should I say?')) {

                break;
            }

            stream.send(tokens.slice(1).join(' '));
            break;

        case `${config.prefix}help`:
            stream.send('Available commands: mp_hello, mp_say <phrase>.');
            break;

        case `${config.prefix}message_stats`:

            // global stats
            if (tokens.length == 1) {

                let users = [];
                message.guild.members.forEach(member => {
                    const respectiveUser = member.user;
                    if (!respectiveUser.bot) {
                        users.push(respectiveUser);
                    }
                });

                if (users.length == 0) {
                    stream.send('There are no humans presented in this ' + 
                        'server to calculate stats.');
                    break;
                }

                getUserChannelMessages(users[0], stream);
            }

            // treats multiple arguments as a list of users
            else {

                const users = retrieveMentionedUsers(message);
                users.forEach(u => {

                    let messages;
                    getUserChannelMessages(u, stream)
                        .then(result => {
                            messages = result;                    
                            console.log(collectWords(messages));
                        });
                });
            }

            break;

        case `mp_test`:
            mentioned = retrieveMentionedUsers(message);
            break;

        default:
            stream.send(`Unknown command. Please refer ` + 
             `to help via "${config.prefix}help".`);
    }

    // if (message.content.startsWith(`${config.prefix}hello`)) {
    //     stream.send('Hi there');
    // }
});

client.login(config.token);
