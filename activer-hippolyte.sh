#!/bin/sh
# Turns on the daily LinkedIn agent for Hippolyte's account (Chrome on port 9334), with his agreement.
#   11:30 every day: his share of invitations (15) and one AI repost
#   every 30 min: accepted invitations → message with the booking link, answers to questions
#   every 5 min: video link when someone books
# To turn it off: launchctl unload ~/Library/LaunchAgents/com.theaicertification.hippolyte-*.plist
N="$HOME/.local/node/actuel/bin/node"
D="$HOME/prospection-ambassadeurs"
mk() {
  f="$HOME/Library/LaunchAgents/$1.plist"
  cat > "$f" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$1</string>
  <key>ProgramArguments</key><array><string>/bin/sh</string><string>-c</string><string>$2</string></array>
  <key>EnvironmentVariables</key><dict><key>CDP_PORT</key><string>9334</string></dict>
  <key>WorkingDirectory</key><string>$D</string>
  $3
  <key>StandardOutPath</key><string>$D/logs/$4.log</string>
  <key>StandardErrorPath</key><string>$D/logs/$4.log</string>
</dict></plist>
EOF
  launchctl unload "$f" 2>/dev/null
  launchctl load "$f" && echo "actif : $1"
}
mk com.theaicertification.hippolyte-daily "$N agent.mjs daily" "<key>StartCalendarInterval</key><dict><key>Hour</key><integer>11</integer><key>Minute</key><integer>30</integer></dict>" h-daily
mk com.theaicertification.hippolyte-watch "$N agent.mjs watch" "<key>StartInterval</key><integer>1800</integer>" h-watch
mk com.theaicertification.hippolyte-notifier "$N notifier.mjs" "<key>StartInterval</key><integer>300</integer>" h-notifier
