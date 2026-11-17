#!/bin/sh
cd "$HOME/prospection-ambassadeurs"; export SITE_TUNNEL=8443 CDP_PORT=9334
N="$HOME/.local/node/actuel/bin/node"
echo "===== Hippolyte daily $(date)"; "$N" agent.mjs daily
echo "===== Hippolyte watch $(date)"; "$N" agent.mjs watch
echo "===== FIN $(date)"
