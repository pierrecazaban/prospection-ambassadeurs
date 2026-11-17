#!/bin/sh
# Builds the target list from Pierre's account, in the background (Chrome minimized).
cd "$HOME/prospection-ambassadeurs"; export SITE_TUNNEL=8443 CDP_PORT=9333
"$HOME/.local/node/actuel/bin/node" agent.mjs list >> logs/list.log 2>&1
