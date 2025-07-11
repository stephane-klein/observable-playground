#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { flatten } from 'flat'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function timestampToDate(timestamp) {
    return new Date(timestamp * 1000);
}

function countWords(text) {
    return (text.match(/\b\w+\b/g) || []).length;
}

const chatGptRawData = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "private", "chatgpt.json"), "utf8"));

const chatGptItemsByMonth = chatGptRawData.reduce(
    (acc, item) => {
        const date = timestampToDate(item.create_time);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

        if (acc[monthKey] === undefined) {
            acc[monthKey] = {
                threadCount: 0,
                userCharacterCount: 0,
                userWordsCount: 0,
                assistantCharacterCount: 0,
                assistantWordsCount: 0
            }
        }
        acc[monthKey].threadCount++;
        acc[monthKey].userCharacterCount = Object.values(item.mapping).reduce(
            (acc, mappingItem) => {
                if (
                    (mappingItem.message?.author?.role !== "user") ||
                    (Array.isArray(mappingItem.message?.content?.parts) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    mappingItem.message.content.parts.reduce((sum, str) => sum + (typeof (str) == "string" ? str.length : 0), 0)
                )
            },
            acc[monthKey].userCharacterCount
        );
        acc[monthKey].userWordsCount = Object.values(item.mapping).reduce(
            (acc, mappingItem) => {
                if (
                    (mappingItem.message?.author?.role !== "user") ||
                    (Array.isArray(mappingItem.message?.content?.parts) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    mappingItem.message.content.parts.reduce((sum, str) => sum + (typeof (str) == "string" ? countWords(str) : 0), 0)
                )
            },
            acc[monthKey].userWordsCount
        );
        acc[monthKey].assistantCharacterCount = Object.values(item.mapping).reduce(
            (acc, mappingItem) => {
                if (
                    (mappingItem.message?.author?.role !== "assistant") ||
                    (Array.isArray(mappingItem.message?.content?.parts) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    mappingItem.message.content.parts.reduce((sum, str) => sum + (typeof (str) == "string" ? str.length : 0), 0)
                )
            },
            acc[monthKey].assistantCharacterCount
        );
        acc[monthKey].assistantWordsCount = Object.values(item.mapping).reduce(
            (acc, mappingItem) => {
                if (
                    (mappingItem.message?.author?.role !== "assistant") ||
                    (Array.isArray(mappingItem.message?.content?.parts) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    mappingItem.message.content.parts.reduce((sum, str) => sum + (typeof (str) == "string" ? countWords(str) : 0), 0)
                )
            },
            acc[monthKey].assistantWordsCount
        );
        return acc;
    },
    {}
);

const claudeRawData = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "private", "claude.json"), "utf8"));

const claudeItemsByMonth = claudeRawData.reduce(
    (acc, item) => {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

        if (acc[monthKey] === undefined) {
            acc[monthKey] = {
                threadCount: 0,
                userCharacterCount: 0,
                userWordsCount: 0,
                assistantCharacterCount: 0,
                assistantWordsCount: 0
            }
        }

        acc[monthKey].threadCount += 1;

        acc[monthKey].userCharacterCount = Object.values(item.chat_messages).reduce(
            (acc, chatMessageItem) => {
                if (
                    (chatMessageItem?.sender !== "human") ||
                    (Array.isArray(chatMessageItem?.content) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    chatMessageItem.content.reduce((sum, content) => sum + content?.text.length || 0, 0)
                )
            },
            acc[monthKey].userCharacterCount
        );
        acc[monthKey].userWordsCount = Object.values(item.chat_messages).reduce(
            (acc, chatMessageItem) => {
                if (
                    (chatMessageItem?.sender !== "human") ||
                    (Array.isArray(chatMessageItem?.content) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    chatMessageItem.content.reduce((sum, content) => sum + countWords(content?.text || ""), 0)
                )
            },
            acc[monthKey].userWordsCount
        )

        acc[monthKey].assistantCharacterCount = Object.values(item.chat_messages).reduce(
            (acc, chatMessageItem) => {
                if (
                    (chatMessageItem?.sender !== "assistant") ||
                    (Array.isArray(chatMessageItem?.content) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    chatMessageItem.content.reduce((sum, content) => sum + content?.text?.length || 0, 0)
                )
            },
            acc[monthKey].assistantCharacterCount
        );
        acc[monthKey].assistantWordsCount = Object.values(item.chat_messages).reduce(
            (acc, chatMessageItem) => {
                if (
                    (chatMessageItem?.sender !== "assistant") ||
                    (Array.isArray(chatMessageItem?.content) !== true)
                ) {
                    return acc;
                }
                return (
                    acc +
                    chatMessageItem.content.reduce((sum, content) => sum + countWords(content?.text || ""), 0)
                )
            },
            acc[monthKey].assistantWordsCount
        )

        return acc;
    },
    {}
);

const result = Object.fromEntries(
    [
        ...new Set([
            ...Object.keys(chatGptItemsByMonth),
            ...Object.keys(claudeItemsByMonth)
        ])
    ]
        .map(key => [
            key,
            {
                chatgpt: (
                    chatGptItemsByMonth[key] || {
                        threadCount: 0,
                        userCharacterCount: 0,
                        userWordsCount: 0,
                        assistantCharacterCount: 0,
                        assistantWordsCount: 0
                    }
                ),
                claude: (
                    claudeItemsByMonth[key] || {
                        threadCount: 0,
                        userCharacterCount: 0,
                        userWordsCount: 0,
                        assistantCharacterCount: 0,
                        assistantWordsCount: 0
                    }
                ),
                total: {
                    threadCount: (
                        (chatGptItemsByMonth[key]?.threadCount || 0) +
                        (claudeItemsByMonth[key]?.threadCount || 0)
                    ),
                    userCharacterCount: (
                        (chatGptItemsByMonth[key]?.userCharacterCount || 0) +
                        (claudeItemsByMonth[key]?.userCharacterCount || 0)
                    ),
                    userWordsCount: (
                        (chatGptItemsByMonth[key]?.userWordsCount || 0) +
                        (claudeItemsByMonth[key]?.userWordsCount || 0)
                    ),
                    assistantCharacterCount: (
                        (chatGptItemsByMonth[key]?.assistantCharacterCount || 0) +
                        (claudeItemsByMonth[key]?.assistantCharacterCount || 0)
                    ),
                    assistantWordsCount: (
                        (chatGptItemsByMonth[key]?.assistantWordsCount || 0) +
                        (claudeItemsByMonth[key]?.assistantWordsCount || 0)
                    ),
                }
            }
        ])
);

const sortedList = Object.entries(result)
.sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
.map(([month, values]) => ({
    month,
    ...flatten(
        values,
        { delimiter: "_"}
    )
}));

fs.writeFileSync(
    path.join(__dirname, "..", "src", "data", "all-conversations.json"),
    JSON.stringify(
        sortedList, null, 4
    )
)
