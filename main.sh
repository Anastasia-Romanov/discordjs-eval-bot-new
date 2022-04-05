while [ true ]; do
  # we're trusting people not to blow up the filesystem here
  node --trace-warnings --trace-deprecation .
done
