#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "private", "chatgpt.json"), "utf8"));

function timestampToDate(timestamp) {
    return new Date(timestamp * 1000);
}

function countWords(text) {
    return (text.match(/\b\w+\b/g) || []).length;
}

const itemsByMonth = rawData.reduce(
    (acc, item) => {
        const date = timestampToDate(item.create_time);
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

fs.writeFileSync(
    path.join(__dirname, "..", "src", "data", "chatgpt.json"),
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
