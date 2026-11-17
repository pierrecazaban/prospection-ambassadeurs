#!/bin/sh
# Outbound SSH tunnels to the VPS, restarted automatically when the network drops them:
#   8443 → the site (API calls, around the network's TLS inspection)   6080 → remote view of the VPS Chromes
while true; do
  ssh -o BatchMode=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=10 -o ServerAliveCountMax=3 -N \
    -L 8443:the-ai-certification.com:443 -L 6080:localhost:6080 ubuntu@158.69.232.131
  sleep 3
done
