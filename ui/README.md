# UI 💅

Instead of using a bash script, this has a `npm run collect` which gets the history and generates `ui/hn.json` which is used by the UI.

Works something like this:

```js
for await (const [html, time] of gitHistory("../hacker-news.html")) {
  // extract json and put it in a big list
  allEntries.push({ time, entries: parseHN(html) });
}
```
