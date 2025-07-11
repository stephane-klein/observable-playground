#!/usr/bin/env node
import * as aq from 'arquero';

const data = await aq.loadJSON("src/data/all-conversations.json");

data
    .fold(
        aq.not('month'),
        { as: ['metric_platform', 'value'] }
    )
    .print();

const long_data = data
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
    .select('month', 'platform', 'role', 'metric', 'value');

long_data.print(10);

long_data
    .filter(d => d.metric === 'thread')
    .derive({ 
        full_key: d => d.role ? 
            `${d.platform}_${d.role}_${d.metric}` : 
            `${d.platform}_${d.metric}`
    })
    .groupby('month')
    .pivot('full_key', 'value')
    .derive({
        total: d => d.chatgpt_thread + d.claude_thread
    })
    .print();
