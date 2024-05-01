# Flat Scraper

This scrapes content from a webpage (hacker news) writes it to git for later use.

See [git scraping](https://simonwillison.net/2020/Oct/9/git-scraping/) & [Flat Data](https://githubnext.com/projects/flat-data) for more info about the approach.

### Updating the data

```bash
export TARGET="hacker-news.html"

curl https://news.ycombinator.com > $TARGET
git add $TARGET
git commit -m ":robot: scraped to $TARGET"
```

### Extracting file history

```bash
git log --pretty=format:"%H %at" -- "$TARGET" | while read commit timestr
do
    git show "$commit:$TARGET" > tmp_${timestr}_${commit}.html
done
```
