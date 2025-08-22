#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-}"
if [[ -z "$TAG" ]]; then
  echo "用法: $0 v1.0.0"
  exit 1
fi

# 仅替换 jsDelivr 的 @段（@后到下一个/或引号）
for f in *.html; do
  # 两种常见前缀：gh 或 npm（我们用 gh）
  sed -i '' -E "s@(https://cdn\.jsdelivr\.net/gh/[^\"'@]+)@[^\"'/<> ]+@\1@$TAG@g" "$f"
done

echo "已将 jsDelivr URL 的版本段替换为 @$TAG"
