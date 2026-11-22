#!/bin/sh
# Virtual screen + window manager + remote view (noVNC on 6080, published on the VPS's localhost only)
# After a restart of the container, the previous screen's lock and Chrome's profile locks are still there: without this
# the screen does not start and Chrome dies at once (seen on 23/11).
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 /data/*/SingletonLock /data/*/SingletonSocket /data/*/SingletonCookie
Xvfb :99 -screen 0 1440x900x24 &
sleep 1
fluxbox >/dev/null 2>&1 &
x11vnc -display :99 -forever -shared -nopw -rfbport 5900 -localhost -quiet &
websockify --web /usr/share/novnc 6080 localhost:5900 >/dev/null 2>&1 &
# One Chrome per LinkedIn account, profiles kept in /data. Same identity as on the Mac (Mac Chrome user agent, French).
CHROME=$(node -e "console.log(require('playwright').chromium.executablePath())")
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36"
# Hippolyte's Chrome (9334) has no task since 19/11: not started any more (22/11). Its profile stays in /data/hippolyte.
for acct in "9333 pierre"; do
  set -- $acct
  mkdir -p /data/$2
  "$CHROME" --remote-debugging-port=$1 --user-data-dir=/data/$2 --no-first-run --no-default-browser-check --no-sandbox \
    --lang=fr-FR --user-agent="$UA" --window-size=1400,880 "about:blank" >/dev/null 2>&1 &
done
exec node scheduler.mjs
