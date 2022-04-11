while [ true ]; do
  # we're trusting people not to blow up the filesystem here
  pnpm ts-node --trace-warnings --trace-deprecation src/index.ts
done
