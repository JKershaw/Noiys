mongo statuses --eval "db.dropDatabase()"
mocha tests/unit/ --ui qunit --reporter nyan
foreman start &
mocha tests/integration/ --ui tdd --reporter nyan --timeout 20000
pkill node