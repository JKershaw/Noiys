set -e
export MONGO_CONNECTION_STRING=mongodb://localhost
export PORT=3000
git pull github master
#./run_tests.sh
git add -A
git commit --message '$@'
echo "Pushing!"
git push
git push github