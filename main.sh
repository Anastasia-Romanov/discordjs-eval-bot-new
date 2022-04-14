# thanks doinky
while [ true ]; do
  #if [ ! -f "./index.js" ]; then
    #echo "index file doesn't exit, fetching from git..."
    #if [ ! -d "./.git" ]; then
    #  git init -q
    #  git remote add origin https://github.com/TheNoob27/discord.js-eval-bot-
    #  git fetch -q
    #  git reset origin/master --hard -q
    #fi
  # git fetch -q
  # git reset origin/master --hard -q
  #fi
  node --trace-warnings --trace-deprecation .
done