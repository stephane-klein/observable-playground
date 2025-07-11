#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import * as aq from 'arquero';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.stdout.write(
    (await aq.loadJSON(path.join(__dirname, "all-conversations.json")))
        .fold(
            aq.not('month'),
            { as: ['metric_platform', 'value'] }
        )
        .filter(
            d => !aq.op.startswith(d.metric_platform, 'total_')
        )
        .derive({
            platform: d => aq.op.split(d.metric_platform, "_")[0],
            role: d => aq.op.match(d.metric_platform, /(user|assistant)/, 0),
            metric: d => aq.op.match(aq.op.lower(d.metric_platform), "(thread|character|words)", 0)
        })
        .select('month', 'platform', 'role', 'metric', 'value')
        .toJSON()
);
