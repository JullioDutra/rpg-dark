#!/usr/bin/env python3
"""Valida data/historia.yaml contra os outros dados do jogo.

Checa: IDs de marcos únicos, requisitos que apontam para marcos existentes,
vilões/subfases/regiões/fatos referenciados existem, camadas de verdade 1..7 cobertas.
Uso: python3 scripts/validar-historia.py
"""
import json
import sys
from pathlib import Path

import yaml

raiz = Path(__file__).resolve().parent.parent
h = yaml.safe_load((raiz / "data/historia.yaml").read_text(encoding="utf-8"))["historia"]
viloes = {v["id"] for v in json.loads((raiz / "data/viloes.json").read_text(encoding="utf-8"))}
subfases = {s["id"] for s in json.loads((raiz / "data/subfases.json").read_text(encoding="utf-8"))}
reinos = json.loads((raiz / "data/reinos.json").read_text(encoding="utf-8"))
regioes = {r["id"] for k in reinos["reinos"] for r in k["regioes"]}
fatos = {f["id"] for f in h["fatos"]}

erros, marcos = [], {}
for ato in h["atos"]:
    for m in ato["marcos"]:
        if m["id"] in marcos:
            erros.append(f"marco duplicado {m['id']}")
        marcos[m["id"]] = m

camadas = set()
for mid, m in marcos.items():
    req = m.get("requer", [])
    lista = req if isinstance(req, list) else req.get("de", [])
    for r in lista:
        if r not in marcos:
            erros.append(f"{mid}: requer marco inexistente {r}")
    for v in m.get("viloes_permitidos", []):
        if v not in viloes:
            erros.append(f"{mid}: vilão inexistente {v}")
    for s in m.get("subfases", []):
        if s not in subfases:
            erros.append(f"{mid}: subfase inexistente {s}")
    for r in m.get("desbloqueia_regioes", []):
        if r not in regioes:
            erros.append(f"{mid}: região inexistente {r}")
    for f in m.get("fatos_disponiveis", []):
        if f not in fatos:
            erros.append(f"{mid}: fato inexistente {f}")
    if m.get("tipo") == "crise" and "prazo_horas_reais" not in m:
        erros.append(f"{mid}: crise sem prazo_horas_reais")
    if "verdade" in m:
        camadas.add(m["verdade"])

faltando = set(range(2, 8)) - camadas
if faltando:
    erros.append(f"camadas de verdade sem marco: {sorted(faltando)}")

if erros:
    print("❌ " + "\n❌ ".join(erros))
    sys.exit(1)
print(f"✔ historia.yaml válido: {len(h['atos'])} atos, {len(marcos)} marcos, {len(fatos)} fatos, camadas {sorted(camadas)}")
