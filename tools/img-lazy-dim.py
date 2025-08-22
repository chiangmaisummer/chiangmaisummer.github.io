#!/usr/bin/env python3
import os, re, subprocess, sys
from pathlib import Path
from html import escape

IMG_TAG_RE = re.compile(r'<img\b[^>]*>', re.IGNORECASE)

# 提取属性为 dict
ATTR_RE = re.compile(r'(\w[\w:-]*)\s*=\s*(".*?"|\'.*?\'|[^\s>]+)')

def parse_attrs(tag:str):
  attrs = {}
  for k,v in ATTR_RE.findall(tag):
    if v.startswith(("'",'"')) and v.endswith(("'",'"')):
      v = v[1:-1]
    attrs[k.lower()] = v
  return attrs

def build_tag(attrs:dict):
  # 尽量保持常见顺序
  order = ['src','alt','loading','width','height','class']
  parts = []
  for k in order:
    if k in attrs:
      parts.append(f'{k}="{escape(attrs[k], quote=True)}"')
  for k,v in attrs.items():
    if k in order: continue
    parts.append(f'{k}="{escape(v, quote=True)}"')
  return "<img " + " ".join(parts) + ">"

def is_remote(src:str)->bool:
  return src.startswith("http://") or src.startswith("https://") or src.startswith("//")

def get_size(local_path:Path):
  try:
    out = subprocess.check_output(["sips","-g","pixelWidth","-g","pixelHeight",str(local_path)], text=True, stderr=subprocess.DEVNULL)
    w = int(re.search(r'pixelWidth:\s*(\d+)', out).group(1))
    h = int(re.search(r'pixelHeight:\s*(\d+)', out).group(1))
    return w,h
  except Exception:
    return None

def process_file(html_path:Path):
  text = html_path.read_text(encoding="utf-8")
  changed = False
  def repl(m):
    nonlocal changed
    tag = m.group(0)
    attrs = parse_attrs(tag)
    src = attrs.get('src','').strip()
    if not src:
      return tag
    # 补 lazy
    if attrs.get('loading','').lower() not in ('lazy','eager','auto'):
      attrs['loading'] = 'lazy'
      changed = True
    # width/height
    if ('width' not in attrs or 'height' not in attrs) and not is_remote(src):
      # 解析相对路径（相对于当前 html 所在目录）
      img_path = (html_path.parent / src).resolve()
      if img_path.exists() and img_path.is_file():
        size = get_size(img_path)
        if size:
          w,h = size
          if 'width' not in attrs:  attrs['width']  = str(w)
          if 'height' not in attrs: attrs['height'] = str(h)
          changed = True
    return build_tag(attrs)

  new_text = IMG_TAG_RE.sub(repl, text)
  if changed:
    html_path.write_text(new_text, encoding="utf-8")
    print(f"[ok] {html_path.name}")
  else:
    print(f"[skip] {html_path.name}")

def main():
  htmls = sorted(Path(".").glob("*.html"))
  if not htmls:
    print("No HTML files found.")
    return
  for p in htmls:
    process_file(p)

if __name__ == "__main__":
  main()
