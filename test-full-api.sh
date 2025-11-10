#!/bin/bash

echo "🧪 测试 Web Lite API - 完整功能"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 健康检查
echo -e "${BLUE}1️⃣ 健康检查${NC}"
curl -s http://localhost:3000/ | jq .
echo ""

# 2. 创建用户
echo -e "${BLUE}2️⃣ 创建用户${NC}"
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com"}')
echo $USER_RESPONSE | jq .
USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
echo -e "${GREEN}✓ 用户创建成功, ID: $USER_ID${NC}"
echo ""

# 3. 创建商品
echo -e "${BLUE}3️⃣ 创建商品${NC}"
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/product \
  -H "Content-Type: application/json" \
  -d '{
    "name":"iPhone 15 Pro",
    "description":"最新款苹果手机",
    "price":"7999.00",
    "stock":100,
    "category":"电子产品",
    "imageUrl":"https://example.com/iphone15.jpg"
  }')
echo $PRODUCT_RESPONSE | jq .
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
echo -e "${GREEN}✓ 商品创建成功, ID: $PRODUCT_ID${NC}"
echo ""

# 4. 获取所有商品
echo -e "${BLUE}4️⃣ 获取所有商品${NC}"
curl -s http://localhost:3000/product | jq .
echo ""

# 5. 创建订单
echo -e "${BLUE}5️⃣ 创建订单${NC}"
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\":$USER_ID,
    \"productId\":$PRODUCT_ID,
    \"quantity\":2,
    \"totalPrice\":\"15998.00\",
    \"status\":\"pending\",
    \"shippingAddress\":\"北京市朝阳区xxx路123号\",
    \"orderNumber\":\"ORD$(date +%Y%m%d%H%M%S)\"
  }")
echo $ORDER_RESPONSE | jq .
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.id')
echo -e "${GREEN}✓ 订单创建成功, ID: $ORDER_ID${NC}"
echo ""

# 6. 获取所有订单
echo -e "${BLUE}6️⃣ 获取所有订单${NC}"
curl -s http://localhost:3000/order | jq .
echo ""

# 7. 更新订单状态
echo -e "${BLUE}7️⃣ 更新订单状态${NC}"
curl -s -X PUT http://localhost:3000/order/$ORDER_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}' | jq .
echo -e "${GREEN}✓ 订单状态已更新${NC}"
echo ""

# 8. 获取单个订单
echo -e "${BLUE}8️⃣ 获取订单详情${NC}"
curl -s http://localhost:3000/order/$ORDER_ID | jq .
echo ""

# 9. 更新商品库存
echo -e "${BLUE}9️⃣ 更新商品库存${NC}"
curl -s -X PUT http://localhost:3000/product/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{"stock":98}' | jq .
echo -e "${GREEN}✓ 库存已更新${NC}"
echo ""

# 10. 获取所有用户
echo -e "${BLUE}🔟 获取所有用户${NC}"
curl -s http://localhost:3000/user | jq .
echo ""

echo -e "${GREEN}✅ 所有测试完成!${NC}"
echo ""
echo "📊 测试总结:"
echo "  • 用户 ID: $USER_ID"
echo "  • 商品 ID: $PRODUCT_ID"
echo "  • 订单 ID: $ORDER_ID"
