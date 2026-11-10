#!/usr/bin/env python3
"""Converte data/historia.yaml em data/historia.json (o servidor Node lê JSON sem dependências).
Uso: python3 scripts/gerar-historia-json.py"""
import json, pathlib, yaml
raiz = pathlib.Path(__file__).resolve().parent.parent
h = yaml.safe_load((raiz / "data/historia.yaml").read_text(encoding="utf-8"))["historia"]
(raiz / "data/historia.json").write_text(json.dumps(h, ensure_ascii=False, indent=1, default=str) + "\n", encoding="utf-8")
print("data/historia.json:", sum(len(a["marcos"]) for a in h["atos"]), "marcos")
