#!/bin/bash

# Fetch the history of the scraped file by iterating through commit history

FILE="../data/hacker-news.html"
DEST="collected"

mkdir -p $DEST
rm -f $DEST/*

# Get details like commit hash, date as Unix timestamp, and author
git log -n 1000 --pretty=format:"%h %at" -- "$FILE" | while read -r commit timestamp; do
  # Use git show to output the file content from each commit to a new file
  # Naming the file with Unix timestamp
  git show "${commit}:${FILE}" > "${DEST}/${timestamp}.html"
done
