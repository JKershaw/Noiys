set -e
mongo statuses --eval "db.dropDatabase()"
mocha tests/unit/ --ui qunit --reporter nyan
foreman start &
mocha tests/integration/ --recursive --ui tdd --reporter nyan --timeout 20000
pkill node
echo "All tests passed! run test_commit.sh to commit"