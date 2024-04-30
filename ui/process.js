#!/usr/bin/node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { parse, join } from 'path';
import { JSDOM } from "jsdom";

const directory = './collected'
const destination = './public/data.json'

const files = await readdir(directory);
const output = [];

// parse a blah/1234.html
const timestamp = (path) => parseInt(parse(path).name, 10);

files.sort(
    // numerical sort, oldest to newest
    (a, b) => timestamp(a) - timestamp(b)
)


for (const file of files) {
    const time = timestamp(file);
    console.log(file, timestamp(file));

    const contents = await readFile(join(directory, file), 'utf8');

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


