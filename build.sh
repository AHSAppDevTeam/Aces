#!/bin/sh

npx webpack
echo "built site"
firebase deploy
echo "site deployed"
