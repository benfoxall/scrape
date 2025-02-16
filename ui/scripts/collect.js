import { writeFile } from 'node:fs/promises';
import { hn2json, historyOf } from './util.js';

const file = "../hacker-news.html"
const destination = 'public/hn.json'

const aggregated = [];

for await (const { time, contents } of historyOf(file, 500)) {

    const entries = hn2json(contents)

    aggregated.push({
        at: time,
        entries
    })

}

await writeFile(destination, JSON.stringify(aggregated));

console.log(`Wrote ${aggregated.length} entries to ${destination}`)
