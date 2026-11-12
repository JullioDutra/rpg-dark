// Índice do mundo vivo: junta as regiões, valida as referências e oferece buscas.
import { readFileSync } from "node:fs";
import { REGIOES_A } from "./regioes-a.mjs";
import { REGIOES_B } from "./regioes-b.mjs";
import { NOVAS, FEMININAS, dnaNpc } from "./regioes-c.mjs";

const ler = (f) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), "utf8"));
export const VILOES = new Map(ler("viloes.json").map((v) => [v.id, v]));
export const MUNDO = { ...REGIOES_A, ...REGIOES_B };
// Novas personagens entram nos locais indicados
for (const [rid, lid, id, npc] of NOVAS) {
  MUNDO[rid].npcs[id] = npc;
  const l = MUNDO[rid].locais.find((x) => x.id === lid);
  l.npcs = [...(l.npcs ?? []), id];
}
for (const r of Object.values(MUNDO)) for (const [id, n] of Object.entries(r.npcs)) n.fem = FEMININAS.has(id);
export { dnaNpc, FEMININAS };

export const COVIL = new Map();      // vilão → { regiao, local, ordem }
export const CAPITULO = new Map();   // id → capítulo (+ regiao)
export const NPC = new Map();        // "regiao:npc" → npc (+ regiao, id, local)
for (const [rid, r] of Object.entries(MUNDO)) {
  for (const l of r.locais) {
    (l.viloes ?? []).forEach((v, ordem) => COVIL.set(v, { regiao: rid, local: l.id, ordem }));
    for (const n of l.npcs ?? []) if (r.npcs[n]) NPC.set(`${rid}:${n}`, { ...r.npcs[n], id: n, regiao: rid, local: l.id });
  }
  for (const c of r.capitulos ?? []) CAPITULO.set(c.id, { ...c, regiao: rid });
}
export const local = (rid, lid) => MUNDO[rid]?.locais.find((l) => l.id === lid) ?? null;
export const npcDe = (rid, nid) => NPC.get(`${rid}:${nid}`) ?? null;

/** Erros de consistência (usado nos testes). */
export function validarMundo(regioesValidas) {
  const erros = [];
  for (const id of VILOES.keys()) if (!COVIL.has(id)) erros.push(`vilão sem covil: ${id}`);
  for (const id of COVIL.keys()) if (!VILOES.has(id)) erros.push(`covil de vilão inexistente: ${id}`);
  const vistos = new Set();
  for (const [rid, r] of Object.entries(MUNDO)) {
    if (regioesValidas && !regioesValidas.has(rid)) erros.push(`região inexistente: ${rid}`);
    for (const l of r.locais) {
      for (const v of l.viloes ?? []) { if (vistos.has(v)) erros.push(`vilão em dois covis: ${v}`); vistos.add(v); }
      for (const n of l.npcs ?? []) if (!r.npcs[n]) erros.push(`${rid}/${l.id}: NPC inexistente ${n}`);
    }
    for (const n of Object.keys(r.npcs)) if (!NPC.has(`${rid}:${n}`)) erros.push(`${rid}: NPC ${n} sem local`);
    for (const c of r.capitulos ?? []) for (const p of c.passos) {
      if (p.t === "falar" && !r.npcs[p.a]) erros.push(`${c.id}: falar com NPC inexistente ${p.a}`);
      if (p.t === "ir" && !local(rid, p.a)) erros.push(`${c.id}: ir a local inexistente ${p.a}`);
      if (p.t === "derrotar" && COVIL.get(p.a)?.regiao !== rid) erros.push(`${c.id}: vilão ${p.a} não está nesta região`);
    }
  }
  for (const rid of regioesValidas ?? []) if (!MUNDO[rid]) erros.push(`região sem mundo vivo: ${rid}`);
  return erros;
}
