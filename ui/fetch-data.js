import { writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { JSDOM } from "jsdom";

const execP = promisify(exec);

const file = "../data/hacker-news.html"
const destination = './public/hn.json'

const output = [];

for await (const { time, contents } of historyOf(file)) {
    console.log("reading ", time);

    const { window: { document } } = new JSDOM(contents);

    const entries = []

    // each entry
    for (const line of document.querySelectorAll('.athing')) {
        // points, user etc
        const subline = line.nextSibling;

        const id = parseInt(line.id, 10)
        const rank = parseInt(line.querySelector('.rank')?.innerHTML, 10)
        const score = parseInt(subline.querySelector('.score')?.innerHTML, 10)

        const link = line.querySelector('.titleline a')
        const text = link.innerHTML;
        const url = link.href

        const created = subline.querySelector('.age')?.getAttribute('title')
        const user = subline.querySelector('.hnuser')?.innerHTML

        // sketchy
        const links = subline.querySelectorAll(`a`)
        const lastLink = links[links.length - 1];
        const comments = parseInt(lastLink?.innerHTML, 10)

        entries.push({ id, rank, score, text, url, user, created, comments })
    }

    output.push({
        at: time * 1000, // ready for new Date(at)
        entries
    })
}

await writeFile(destination, JSON.stringify(output, null, 2));

console.log(`Wrote ${output.length} entries to ${destination}`)





// iterate across the history of a file
async function* historyOf(file) {
    const { stdout } = await execP(`git log -n 1000 --pretty=format:"%H %at" -- "${file}"`);
    const entries = stdout.split('\n').map(row => row.split(' '));
    for (const [commit, timestr] of entries) {

        const time = new Date(parseFloat(timestr) * 1000)

        const { stdout } = await execP(`git show "${commit}:${file}"`)

        yield {
            time,
            contents: stdout
        }
    }
}
