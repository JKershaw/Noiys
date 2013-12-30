set -e
./run_tests.sh
git add -A
git commit --message '$@'
echo "Don't forget to run git push!"