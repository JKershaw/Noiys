set -e
mongo statuses --eval "db.dropDatabase()"
mocha tests/unit/ --ui qunit --reporter nyan

git add -A
git commit --message '$@'