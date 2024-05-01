import { writeFile } from 'node:fs/promises';
import { hn2json, historyOf } from './util.js';

const file = "hacker-news.latest.html"
const destination = 'hacker-news.json'

const aggregated = [];

for await (const { time, contents } of historyOf(file)) {

    const entries = hn2json(contents)

    aggregated.push({
        at: time,
        entries
    })

    if (aggregated.length > 500) break;
}

await writeFile(destination, JSON.stringify(aggregated));

console.log(`Wrote ${aggregated.length} entries to ${destination}`)




