#!/bin/bash
# Simple API test script for Digital Wardrobe

BASE_URL="http://localhost:5001/api"
TS=$(date +%s)
EMAIL="apitest-$TS@example.com"
USERNAME="apitest-$TS"
PASSWORD="Test1234!"

echo "== Health =="
curl -s $BASE_URL/health | jq
echo ""

echo "== Register =="
RESP_REG=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$RESP_REG" | jq
TOKEN=$(echo "$RESP_REG" | jq -r '.token')
USER_ID=$(echo "$RESP_REG" | jq -r '.user.id')
echo "User ID: $USER_ID"
echo ""

echo "== Login =="
RESP_LOG=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$RESP_LOG" | jq
TOKEN=$(echo "$RESP_LOG" | jq -r '.token')
echo "Token: $TOKEN"
echo ""

echo "== Auth Me =="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/auth/me | jq
echo ""

echo "== Items (user) =="
curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/items/user/$USER_ID | jq
echo ""

