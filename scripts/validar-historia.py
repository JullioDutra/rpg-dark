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

# Encruzilhadas
for e in h.get("encruzilhadas", []):
    if e["marco"] not in marcos:
        erros.append(f"{e['id']}: marco inexistente {e['marco']}")
    if len(e["opcoes"]) < 2:
        erros.append(f"{e['id']}: precisa de 2+ opções")
bandeiras = {o["bandeira"] for e in h.get("encruzilhadas", []) for o in e["opcoes"]}
for b in h.get("epilogos_por_bandeira", {}):
    if b not in bandeiras:
        erros.append(f"epílogo para bandeira inexistente: {b}")

# Contos, flashbacks, chaves, trajetória
c = yaml.safe_load((raiz / "data/contos.yaml").read_text(encoding="utf-8"))
ids_fb = {f["id"] for f in c["flashbacks"]}
ids_c = {x["id"] for x in c["contos"]}
ids_k = {k["id"] for k in c["chaves"]}
for k in c["chaves"]:
    for o in k["obtencao"]:
        if o not in ids_fb | ids_c | set(marcos):
            erros.append(f"{k['id']}: origem inexistente {o}")
    if len(k["obtencao"]) < 1:
        erros.append(f"{k['id']}: sem forma de obter")
for f in c["flashbacks"]:
    for k in [f.get("chave")] if not isinstance(f.get("chave"), list) else f["chave"]:
        if k and k not in ids_k:
            erros.append(f"{f['id']}: chave inexistente {k}")
for x in c["contos"]:
    if x["regiao"] not in regioes:
        erros.append(f"{x['id']}: região inexistente {x['regiao']}")
orfas = [k["id"] for k in c["chaves"] if not any(
    (f.get("chave") == k["id"]) or (isinstance(f.get("chave"), list) and k["id"] in f["chave"]) for f in c["flashbacks"])
    and not any(o in marcos or o in ids_c for o in k["obtencao"])]
if orfas:
    erros.append(f"chaves sem flashback/conto/marco que as conceda: {orfas}")

faltando = set(range(2, 8)) - camadas
if faltando:
    erros.append(f"camadas de verdade sem marco: {sorted(faltando)}")

if erros:
    print("❌ " + "\n❌ ".join(erros))
    sys.exit(1)
print(f"✔ historia.yaml válido: {len(h['atos'])} atos, {len(marcos)} marcos, {len(fatos)} fatos, camadas {sorted(camadas)}, "
      f"{len(h.get('encruzilhadas', []))} encruzilhadas")
print(f"✔ contos.yaml válido: {len(c['contos'])} contos, {len(c['flashbacks'])} flashbacks, {len(c['chaves'])} chaves, {len(c['trajetoria'])} marcas de trajetória")
