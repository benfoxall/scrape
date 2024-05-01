# Flat Scraper

This pulls the [HN](https://news.ycombinator.com/) front page to [hacker-news.html](hacker-news.html) and uses git log/show to access a history of changes.

See [git scraping](https://simonwillison.net/2020/Oct/9/git-scraping/) & [Flat Data](https://githubnext.com/projects/flat-data) for more info about the approach.

### Updating the data

```bash
export TARGET="hacker-news.html"

curl https://news.ycombinator.com > $TARGET
git add $TARGET
git commit -m ":robot: scraped to $TARGET"
```

This is run automatically by [.github/workflows/scrape.yml](.github/workflows/scrape.yml)

### Extracting file history

```bash
git log --pretty=format:"%H %at" -- "$TARGET" | while read commit timestr
do
    git show "$commit:$TARGET" > tmp_${timestr}_${commit}.html
done
```

## UI
