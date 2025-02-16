import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { JSDOM } from "jsdom";

const execP = promisify(exec);


/** parse a hn landing page, extracting entries */
export function hn2json(html) {
    const { window: { document } } = new JSDOM(html);

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

    return entries;
}


/** iterate through the history of a file */
export async function* historyOf(file, count) {
    const { stdout } = await execP(`git log --pretty=format:"%H %at" -- "${file}" | head -n ${count}`);
    const entries = stdout.split('\n').filter(l => l.length).map(row => row.split(' '));

    for (const [commit, timestr] of entries) {

        const time = new Date(parseFloat(timestr) * 1000)

        const { stdout } = await execP(`git show "${commit}:${file}"`)

        yield {
            time,
            contents: stdout
        }
    }
}
