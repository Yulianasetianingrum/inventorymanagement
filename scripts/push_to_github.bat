@echo off
echo "--- GIT ADD ---"
git add .
echo "--- GIT COMMIT ---"
git commit -m "Update inventory system: Worker portal optimization and stock sync"
echo "--- GIT PUSH ---"
git push origin HEAD
echo "--- GIT STATUS ---"
git status
