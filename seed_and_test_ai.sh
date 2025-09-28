#!/bin/bash
set -euo pipefail

BASE_URL="http://localhost:5001/api"
TS=$(date +%s)
EMAIL="seed-$TS@example.com"
USERNAME="seed-$TS"
PASSWORD="Test1234!"

echo "== Health =="
curl -s "$BASE_URL/health" | jq '{status, message}' || true

echo "== Register =="
RESP_REG=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$RESP_REG" | jq '{message, user: .user | {id, username, email}}'
TOKEN=$(echo "$RESP_REG" | jq -r '.token')
USER_ID=$(echo "$RESP_REG" | jq -r '.user.id')
echo "User ID: $USER_ID"

echo "== Upload items =="
IMG="frontend/public/logo192.png"
upload_item() {
  local NAME="$1"; local CATEGORY="$2"; local SUBCATEGORY="$3"; local COLOR="$4"; local HEX="$5"; local STYLE="$6"; local SEASON="$7"; local OCC="$8"; local IMAGE="$9"
  echo "-- Upload: $NAME ($CATEGORY/$SUBCATEGORY, $COLOR)"
  curl -s -X POST "$BASE_URL/items/upload" \
    -H "Authorization: Bearer $TOKEN" \
    -F "image=@$IMAGE" \
    -F "name=$NAME" \
    -F "category=$CATEGORY" \
    -F "subcategory=$SUBCATEGORY" \
    -F "color=$COLOR" \
    -F "colorHex=$HEX" \
    -F "style=$STYLE" \
    -F "season=$SEASON" \
    -F "occasion=$OCC" \
    | jq '.item | {id: ._id, name: .name, category: .category, color: .color}'
}

upload_item "Blue T-Shirt" "top" "t-shirt" "blue" "#1e90ff" "casual" "all-season" "casual" "$IMG"
upload_item "Black Jeans" "bottom" "jeans" "black" "#000000" "casual" "all-season" "casual" "$IMG"
upload_item "White Sneakers" "shoes" "sneakers" "white" "#ffffff" "casual" "all-season" "casual" "$IMG"

echo "== AI Suggest Outfits =="
curl -s -X POST "$BASE_URL/ai/suggest-outfits" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"occasion\":\"casual\",\"weather\":\"moderate\",\"style\":\"casual\",\"season\":\"all-season\",\"preferredColor\":\"blue\"}" | jq '{message, outfits_count: (.outfits|length), outfits: [.outfits[]|{name, items, aiConfidence: .aiConfidence, notes: .notes}]}'

echo "== Style Recommendations =="
curl -s -X GET "$BASE_URL/ai/style-recommendations" \
  -H "Authorization: Bearer $TOKEN" | jq '{message, recommendations_count: (.recommendations|length), sample: (.recommendations|.[0])}'

echo "== Done =="