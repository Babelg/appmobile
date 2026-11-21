#!/usr/bin/env python3
"""
Busca o valor da Tabela FIPE de cada carro e salva em src/data/fipe.json.

Uso:  python3 scripts/fetch_fipe.py                 (ou: npm run fipe) — atualiza todos
      python3 scripts/fetch_fipe.py polo,onix       — atualiza só esses

Entrada: scripts/fipe.json
  { "<carId>": { "brand": <código da marca na FIPE>, "model": "<nome exato do modelo na FIPE>",
                 "year": 2014 (opcional; padrão = ano-modelo mais recente, sem contar "0 km") } }

Fonte: API pública da Tabela FIPE em fipe.parallelum.com.br (espelho da tabela oficial).
A tabela muda todo mês; rode de novo para atualizar. O app mostra o mês de referência.
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "scripts" / "fipe.json"
OUT = ROOT / "src" / "data" / "fipe.json"
API = "https://fipe.parallelum.com.br/api/v2/cars/brands"
UA = "CarQuizFipeFetcher/1.0 (educational quiz app)"


def get(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    time.sleep(1.5)  # a API limita a 50 pedidos por minuto
    return data


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


def main() -> None:
    config = json.loads(CONFIG.read_text())
    only = set(sys.argv[1].split(",")) if len(sys.argv) > 1 else None
    models_cache: dict[int, list] = {}
    out = json.loads(OUT.read_text()) if only and OUT.exists() else {}
    for car_id, entry in config.items():
        if only and car_id not in only:
            continue
        brand = entry["brand"]
        if brand not in models_cache:
            models_cache[brand] = get(f"{API}/{brand}/models")
        model = next((m for m in models_cache[brand] if norm(m["name"]) == norm(entry["model"])), None)
        if not model:
            raise SystemExit(f"{car_id}: modelo não encontrado na FIPE: {entry['model']}")
        years = get(f"{API}/{brand}/models/{model['code']}/years")
        dated = [y for y in years if not y["code"].startswith("32000")]  # 32000 = "zero km"
        if "year" in entry:
            dated = [y for y in dated if y["code"].startswith(str(entry["year"]))]
        if not dated:
            raise SystemExit(f"{car_id}: ano não encontrado na FIPE")
        year = max(dated, key=lambda y: int(y["code"].split("-")[0]))
        info = get(f"{API}/{brand}/models/{model['code']}/years/{year['code']}")
        out[car_id] = {
            "price": info["price"].strip(),
            "model": re.sub(r"\s+", " ", info["model"]).strip(),
            "year": info["modelYear"],
            "fuel": info["fuel"],
            "code": info["codeFipe"],
            "ref": info["referenceMonth"].strip(),
        }
        print(f"{car_id:8s} {out[car_id]['price']:>16s}  {out[car_id]['year']}  {out[car_id]['model']}", flush=True)
    out = {k: out[k] for k in config if k in out}
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print(f"{len(out)} carros, referência: {next(iter(out.values()))['ref']}")


if __name__ == "__main__":
    main()
