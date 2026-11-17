#!/bin/sh
# While the agent works, keep the prospection Chrome windows minimized (they never come up in front of the user).
cd "$HOME/prospection-ambassadeurs"
while pgrep -f "agent.mjs" > /dev/null; do
  "$HOME/.local/node/actuel/bin/node" hide-chrome.mjs 9333 > /dev/null 2>&1; "$HOME/.local/node/actuel/bin/node" hide-chrome.mjs 9334 > /dev/null 2>&1
  sleep 20
done
