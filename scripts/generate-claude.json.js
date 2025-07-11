#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "private", "claude.json"), "utf8"));

function countWords(text) {
    return (text.match(/\b\w+\b/g) || []).length;
}

const itemsByMonth = rawData.reduce(
    (acc, item) => {
        const date = new Date(item.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

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

fs.writeFileSync(
    path.join(__dirname, "..", "src", "data", "claude.json"),
    JSON.stringify(
        {
            byMonth: Object.entries(itemsByMonth)
                .map(([month, count]) => ({ month, count }))
                .sort((a, b) => a.month.localeCompare(b.month)),

            summary: {
                total: rawData.length
            }
        },
        null,
        4
    )
)
