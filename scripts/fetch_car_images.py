#!/usr/bin/env python3
"""
Baixa as fotos dos carros do Wikimedia Commons, recorta em 4:3 e gera os créditos.

Uso:  python3 scripts/fetch_car_images.py            (baixa só o que falta)
      python3 scripts/fetch_car_images.py --force    (baixa tudo de novo)

Entrada: scripts/car-images.json
  { "<carId>": { "file": "File:Nome no Commons.jpg", "centerX": 0.5, "centerY": 0.5 } }
  centerX/centerY (opcionais) escolhem o centro do recorte 4:3 na foto original.

Saída:
  assets/cars/<carId>.jpg   1440x1080, JPEG
  src/data/credits.json     autor, licença e link de cada foto (obrigatório p/ CC BY / BY-SA)
  src/data/carImages.ts     mapa carId -> require() (Metro precisa de requires estáticos)

Requer: Pillow (pip install pillow)
"""
import hashlib
import html
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "scripts" / "car-images.json"
OUT_DIR = ROOT / "assets" / "cars"
CACHE_DIR = ROOT / "scripts" / ".cache"  # originais baixados (fora do git), para recortar de novo sem baixar
CREDITS = ROOT / "src" / "data" / "credits.json"
IMAGES_TS = ROOT / "src" / "data" / "carImages.ts"

API = "https://commons.wikimedia.org/w/api.php"
UA = "CarQuizAssetFetcher/1.0 (educational quiz app)"
OUT_W, OUT_H = 1440, 1080
FETCH_WIDTH = 1920  # tamanho de miniatura padrão do Wikimedia


def get(url: str, tries: int = 25) -> bytes:
    """GET respeitando o limite de taxa do Wikimedia (HTTP 429 + Retry-After)."""
    for i in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
            time.sleep(2.0)
            return data
        except urllib.error.HTTPError as e:
            if e.code == 429 and i < tries - 1:
                wait = int(e.headers.get("Retry-After") or 20)
                print(f"  429 em {url[:90]}... aguardando {wait}s", file=sys.stderr, flush=True)
                time.sleep(min(wait + 5, 900))
                continue
            raise
    raise RuntimeError("unreachable")


def strip_html(value: str) -> str:
    text = re.sub(r"<[^>]+>", "", value or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def image_info(title: str) -> dict:
    params = {
        "action": "query",
        "format": "json",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiurlwidth": FETCH_WIDTH,
    }
    data = json.loads(get(API + "?" + urllib.parse.urlencode(params)))
    page = next(iter(data["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise SystemExit(f"Arquivo não encontrado no Commons: {title}")
    return page["imageinfo"][0]


def crop_4x3(img: Image.Image, cx: float, cy: float) -> Image.Image:
    w, h = img.size
    if w / h > 4 / 3:
        nw, nh = int(h * 4 / 3), h
    else:
        nw, nh = w, int(w * 3 / 4)
    left = min(max(0, int(cx * w - nw / 2)), w - nw)
    top = min(max(0, int(cy * h - nh / 2)), h - nh)
    return img.crop((left, top, left + nw, top + nh)).resize((OUT_W, OUT_H), Image.LANCZOS)


def main() -> None:
    force = "--force" in sys.argv
    config = json.loads(CONFIG.read_text())
    credits = json.loads(CREDITS.read_text()) if CREDITS.exists() and not force else {}
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for car_id, entry in config.items():
        out = OUT_DIR / f"{car_id}.jpg"
        if out.exists() and car_id in credits and credits[car_id].get("file") == entry["file"] and not force:
            continue
        info = image_info(entry["file"])
        meta = info.get("extmetadata", {})
        cached = CACHE_DIR / f"{car_id}-{hashlib.md5(entry['file'].encode()).hexdigest()[:8]}.jpg"
        if cached.exists():
            raw = cached.read_bytes()
        else:
            raw = get(info.get("thumburl") or info["url"])
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            cached.write_bytes(raw)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        crop_4x3(img, entry.get("centerX", 0.5), entry.get("centerY", 0.5)).save(
            out, "JPEG", quality=80, optimize=True, progressive=True
        )
        credits[car_id] = {
            "file": entry["file"],
            "author": strip_html(meta.get("Artist", {}).get("value", "")) or "Autor desconhecido",
            "license": strip_html(meta.get("LicenseShortName", {}).get("value", "")),
            "licenseUrl": meta.get("LicenseUrl", {}).get("value", ""),
            "source": info["descriptionurl"],
        }
        CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")  # salva a cada foto
        print(f"ok  {car_id:12s} {credits[car_id]['license']:14s} {credits[car_id]['author'][:40]}", flush=True)

    credits = {k: credits[k] for k in config if k in credits}
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n")

    lines = [
        "// Gerado por scripts/fetch_car_images.py — não edite à mão.",
        "",
        "/** carId -> asset da foto (o require() devolve o id do asset no Metro). */",
        "export const CAR_IMAGES: Record<string, number> = {",
        *[f"  {k}: require('../../assets/cars/{k}.jpg')," for k in config],
        "};",
        "",
    ]
    IMAGES_TS.write_text("\n".join(lines))
    print(f"{len(config)} imagens, créditos em {CREDITS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
