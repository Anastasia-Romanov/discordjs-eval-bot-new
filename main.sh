while [ true ]; do
  # we're trusting people not to blow up the filesystem here
  NODE_OPTIONS="--trace-warnings --trace-deprecation" pnpm ts-node src/index.ts
done
