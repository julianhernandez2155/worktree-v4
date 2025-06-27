#!/bin/bash

# Replace 'YOUR_GITHUB_USERNAME' with your actual GitHub username
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"

echo "Setting up GitHub remote..."
git remote add origin https://github.com/$GITHUB_USERNAME/worktree-v4.git

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "Done! Your code is now on GitHub."