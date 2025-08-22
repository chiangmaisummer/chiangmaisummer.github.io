#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

echo "== Minified size report =="
printf "%-28s %12s %12s %10s %12s %12s %10s\n" "File" "Raw(KB)" "Min(KB)" "Saved" "Gzip(KB)" "GzMin(KB)" "Saved"

sum_raw=0 sum_min=0 sum_gz=0 sum_gzmin=0

report_file () {
  local src="$1" min="$2"
  local rawb minb gz gzmin
  rawb=$(wc -c < "$src" | tr -d ' ')
  minb=$(wc -c < "$min" | tr -d ' ')
  gz=$(gzip -c -9 "$src" | wc -c | tr -d ' ')
  gzmin=$(gzip -c -9 "$min" | wc -c | tr -d ' ')
  sum_raw=$((sum_raw+rawb)); sum_min=$((sum_min+minb))
  sum_gz=$((sum_gz+gz)); sum_gzmin=$((sum_gzmin+gzmin))
  printf "%-28s %12.1f %12.1f %9.0f%% %12.1f %12.1f %9.0f%%\n" \
    "$(basename "$src")" \
    "$(echo "scale=1;$rawb/1024" | bc)" \
    "$(echo "scale=1;$minb/1024" | bc)" \
    "$(echo "scale=4;(1-($minb/$rawb))*100" | bc)" \
    "$(echo "scale=1;$gz/1024" | bc)" \
    "$(echo "scale=1;$gzmin/1024" | bc)" \
    "$(echo "scale=4;(1-($gzmin/$gz))*100" | bc)"
}

# CSS/JS 成对统计：xxx.css vs xxx.min.css, xxx.js vs xxx.min.js（跳过本来就 .min. 的）
for src in *.css *.js ; do
  [[ "$src" == *.min.* ]] && continue
  [[ -f "$src" ]] || continue
  min="${src%.*}.min.${src##*.}"
  [[ -f "$min" ]] || { echo "WARN: $min 不存在，跳过 $src"; continue; }
  report_file "$src" "$min"
done

# 汇总
printf "%-28s %12.1f %12.1f %9.0f%% %12.1f %12.1f %9.0f%%\n" \
  "TOTAL" \
  "$(echo "scale=1;$sum_raw/1024" | bc)" \
  "$(echo "scale=1;$sum_min/1024" | bc)" \
  "$(echo "scale=4;(1-($sum_min/$sum_raw))*100" | bc)" \
  "$(echo "scale=1;$sum_gz/1024" | bc)" \
  "$(echo "scale=1;$sum_gzmin/1024" | bc)" \
  "$(echo "scale=4;(1-($sum_gzmin/$sum_gz))*100" | bc)"
