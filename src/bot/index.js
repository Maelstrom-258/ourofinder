import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { solveOuroquest } from '../core/ouroquest.js';
import { solveOurochest } from '../core/ourochest.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// A map to store our suggestion message IDs to edit them later
const activeGames = new Map();

client.on('ready', () => {
    console.log(`Ourofinder Bot logged in as ${client.user?.tag}`);
});

function parseMinigame(message) {
    if (!message.author?.bot) return null;

    // Attempt to identify minigames
    const isQuest = message.content?.toLowerCase().includes('quest') || message.embeds.some(e => e.description?.toLowerCase().includes('quest') || e.title?.toLowerCase().includes('quest'));
    const isChest = message.content?.toLowerCase().includes('chest') || message.embeds.some(e => e.description?.toLowerCase().includes('chest') || e.title?.toLowerCase().includes('chest'));

    if (!isQuest && !isChest) return null;

    let grid = null;

    // Check if it uses buttons (message.components)
    if (message.components?.length === 5 && message.components[0].components?.length === 5) {
        grid = [];
        for (let row of message.components) {
            let rowColors = [];
            for (let btn of row.components) {
                if (btn.emoji && btn.emoji.name) {
                    let en = btn.emoji.name;
                    if (['SpB'].includes(en)) rowColors.push(isQuest ? 0 : 'blue');
                    else if (['SpT'].includes(en)) rowColors.push(isQuest ? 1 : 'cyan');
                    else if (['SpG'].includes(en)) rowColors.push(isQuest ? 2 : 'green');
                    else if (['SpY'].includes(en)) rowColors.push(isQuest ? 3 : 'yellow');
                    else if (['SpO'].includes(en)) rowColors.push(isQuest ? 4 : 'orange');
                    else if (['SpP'].includes(en)) rowColors.push('purple');
                    else if (['SpR'].includes(en)) rowColors.push('red');
                    else if (['SpU', 'SpW', 'SpL', 'SpD'].includes(en)) rowColors.push('empty');
                    else rowColors.push('hidden');
                } else {
                    rowColors.push('hidden'); // UNCLICKED or NO EMOJI
                }
            }
            grid.push(rowColors);
        }
    }

    if (!grid) return null;
    return { type: isQuest ? 'quest' : 'chest', grid };
}

async function handleMinigameUpdate(message) {
    const minigame = parseMinigame(message);
    if (!minigame) return;

    let solution;
    try {
        if (minigame.type === 'quest') {
            solution = solveOuroquest(minigame.grid);
        } else {
            solution = solveOurochest(minigame.grid);
        }
    } catch (e) {
        console.error("Solver error:", e);
        return;
    }

    if (!solution || !solution.probabilities || solution.validBoards === 0) return;

    // Find best move
    let bestMoveText = "Calculating...";
    let maxProb = -1;
    let bestMoves = [];

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (minigame.grid[r][c] === 'hidden') {
                let p = solution.probabilities[r][c];
                if (p > maxProb) {
                    maxProb = p;
                    bestMoves = [{ r, c, p }];
                } else if (p === maxProb) {
                    bestMoves.push({ r, c, p });
                }
            }
        }
    }

    const emojiMap = {
        'hidden': '⬛',
        'empty': '⬜',
        'purple': '🟪',
        0: '🟦',
        1: '💠', // Cyan
        2: '🟩',
        3: '🟨',
        4: '🟧',
        'blue': '🟦',
        'cyan': '💠',
        'green': '🟩',
        'yellow': '🟨',
        'orange': '🟧',
        'red': '🟥'
    };

    let visualBoard = "";
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            let isBest = bestMoves.some(m => m.r === r && m.c === c);
            if (isBest) {
                visualBoard += '🎯'; // crosshair for the move
            } else {
                let val = minigame.grid[r][c];
                visualBoard += emojiMap[val] || '⬛';
            }
        }
        visualBoard += '\n';
    }

    if (bestMoves.length > 0 && maxProb > 0) {
        let targets = bestMoves.map(m => `**Row ${m.r + 1}, Col ${m.c + 1}** (${(m.p * 100).toFixed(0)}%)`).join('\n');
        bestMoveText = `🎯 **Best Expected Move(s):**\n${targets}\n\n**Grid Analysis:**\n${visualBoard}\n\n*Valid configurations remaining: ${solution.validBoards}*`;
    } else {
        bestMoveText = `**Analysis Complete:**\n${visualBoard}\n\nGame seems to be finished or board is fully clear!`;
    }

    const embed = new EmbedBuilder()
        .setTitle(`Ourofinder: ${minigame.type.toUpperCase()}`)
        .setColor(minigame.type === 'quest' ? '#be7bdc' : '#f25b5b')
        .setDescription(bestMoveText)
        .setFooter({ text: 'Ourofinder Helper' });

    // Try to edit if we already answered
    if (activeGames.has(message.id)) {
        const replyId = activeGames.get(message.id);
        try {
            const replyMsg = await message.channel.messages.fetch(replyId);
            await replyMsg.edit({ embeds: [embed] });
        } catch (e) {
            // message might be deleted, so we resend and update.
            const replyMsg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            activeGames.set(message.id, replyMsg.id);
        }
    } else {
        const replyMsg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        activeGames.set(message.id, replyMsg.id);
    }
}

client.on('messageCreate', handleMinigameUpdate);
client.on('messageUpdate', (oldMsg, newMsg) => handleMinigameUpdate(newMsg));

if (!process.env.DISCORD_TOKEN) {
    console.error("No DISCORD_TOKEN found in .env, bot cannot login.");
}

client.login(process.env.DISCORD_TOKEN);
