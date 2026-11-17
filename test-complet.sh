#!/bin/sh
# Real end-to-end pass on the Mac: Pierre (9333) then Hippolyte (9334), daily then watch, logged to logs/test-complet.log
cd "$HOME/prospection-ambassadeurs"
N="$HOME/.local/node/actuel/bin/node"; export SITE_TUNNEL=8443
for port in 9333 9334; do
  echo "===== compte $port : daily $(date)"; CDP_PORT=$port "$N" agent.mjs daily
  echo "===== compte $port : watch $(date)"; CDP_PORT=$port "$N" agent.mjs watch
done
echo "===== FIN $(date)"
