set -e
./run_tests.sh
git add -A
git commit --message '$@'