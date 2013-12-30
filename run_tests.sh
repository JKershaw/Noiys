set -e
pkill node &
mongo statuses --eval "db.dropDatabase()"
mocha tests/unit/ --ui qunit --reporter nyan
foreman start &
sleep 1
mocha tests/integration/api/ --recursive --ui tdd --reporter nyan --timeout 20000
#mocha tests/integration/frontend/ --recursive --ui tdd --reporter nyan --timeout 20000
pkill node
echo "All tests passed! run test_commit.sh to commit"