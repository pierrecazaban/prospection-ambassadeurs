#!/bin/sh
# Waits for the list build to finish, then sends today's remaining invitations.
cd "$HOME/prospection-ambassadeurs"
while pgrep -f "agent.mjs list" > /dev/null || [ -f agent.lock ]; do sleep 30; done
"$HOME/.local/node/actuel/bin/node" agent.mjs daily >> logs/daily.log 2>&1
