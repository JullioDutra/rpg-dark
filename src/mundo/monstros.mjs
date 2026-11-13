// 20 monstros que não fazem parte da campanha: aparecem quando o mestre os coloca numa cidade, ou (os de grau 4)
// como Calamidades, quando a história do mundo já andou. Derrotá-los dá ryō, mérito e XP; nunca fecha capítulo.
// grau: 1 = bando, 2 = fera grande, 3 = terror de cidade, 4 = calamidade.
const M = (id, nome, titulo, grau, elemento, tipo, cor, cor2, corOlhos, desc, extra = {}) => ({ id, nome, titulo, grau, elemento, tipo, cor, cor2, corOlhos, desc, ...extra });
export const MONSTROS = [
  M("M01", "Gakidama", "o Enxame Faminto", 1, "Trevas", "enxame", "#3a2a4a", "#8a5ac0", "vermelho", "Centenas de pequenas bocas voando juntas. Comem estoque, telhado e, se deixarem, gente."),
  M("M02", "Nezumi-ō", "o Rei dos Ratos de Esgoto", 1, "Veneno", "fera", "#5a5048", "#8a7a68", "vermelho", "Um rato do tamanho de um boi, seguido por todos os outros.", { orelhas: "redondas", focinho: "longo", dentes: true }),
  M("M03", "Kawa-onna", "a Rã do Poço Seco", 1, "Água", "anfibio", "#3a7a5a", "#b8d890", "dourado", "Bebeu o poço da cidade inteiro e agora cospe de volta só lama."),
  M("M04", "Hibashiri", "o Corredor de Brasas", 1, "Fogo", "centopeia", "#a8401a", "#ffb02a", "ambar", "Uma centopeia em chamas que corre pelos telhados. Onde passa, pega fogo."),
  M("M05", "Kazekiri", "a Ave que Corta o Vento", 1, "Vento", "ave", "#c8d8e8", "#6a8aa8", "azul", "Mergulha sobre a praça e leva o que estiver brilhando. Às vezes é uma espada. Às vezes é uma criança.", { crista: true }),
  M("M06", "Tsuchigumo", "a Aranha de Barro", 2, "Terra", "aracnideo", "#7a5a3a", "#c8a070", "vermelho", "Tece teias de barro entre as casas. Quem encosta, endurece junto."),
  M("M07", "Umibōzu", "o Monge do Mar Parado", 2, "Água", "espirito", "#1a2a4a", "#4a7ab0", "branco", "Uma sombra enorme e careca que sobe do porto em noites sem onda e pede um balde. Não dê."),
  M("M08", "Onibi-gashira", "a Caveira de Fogo-Fátuo", 2, "Fogo", "cranio", "#e8e0d0", "#6ad0ff", "azul", "Um crânio gigante que flutua pelas ruas chamando nomes. Quem responde, segue atrás."),
  M("M09", "Yamajii", "o Velho da Montanha", 2, "Terra", "golem", "#6a6a5a", "#a8b090", "ambar", "Um golem coberto de musgo que desceu da serra porque alguém cortou a árvore errada."),
  M("M10", "Nure-hebi", "a Serpente Encharcada", 2, "Água", "serpente", "#2a5a6a", "#90d0c0", "dourado", "Enrola-se no sino da cidade e não deixa ninguém tocar o alarme."),
  M("M11", "Raijū", "a Fera do Trovão", 2, "Raio", "fera", "#e8e080", "#ffffff", "azul", "Cai com o raio e fica. Corre em círculos pela praça, e cada volta é um relâmpago.", { orelhas: "pontudas", crina: true, dentes: true }),
  M("M12", "Kage-kujira", "a Baleia de Sombra", 3, "Trevas", "peixe", "#14101e", "#5a4a8a", "branco", "Nada pelo céu da cidade ao entardecer. A sombra dela apaga lamparinas e lembranças."),
  M("M13", "Jorōgumo", "a Tecelã de Maridos", 3, "Veneno", "aracnideo", "#2a1a2a", "#e85a8a", "vermelho", "Metade da cidade diz que ela é só uma viúva bonita. A outra metade não diz mais nada."),
  M("M14", "Daidarabotchi", "o Gigante que Molda Morros", 3, "Terra", "golem", "#4a4038", "#d8c090", "dourado", "Sentou-se ao lado da muralha para descansar. A muralha não aguentou."),
  M("M15", "Shinigami-bana", "a Flor que Colhe", 3, "Natureza", "coracao", "#7a1a3a", "#e86a8a", "dourado", "Um coração vegetal enraizado na praça. Bate devagar, e a cada batida alguém na cidade envelhece um ano."),
  M("M16", "Fūjin-no-ko", "o Filho do Vendaval", 3, "Vento", "redemoinho", "#b8c8d8", "#ffffff", "azul", "Um redemoinho com olhos. Não é mau: é uma criança brincando. O problema é do que ele brinca."),
  M("M17", "Ōmukade", "a Centopeia das Sete Voltas", 4, "Veneno", "centopeia", "#3a1a1a", "#c8301a", "vermelho", "Dá sete voltas em torno de uma montanha. Quando acorda com fome, desce para os reinos.", { calamidade: "A terra treme em ondas, como se algo comprido passasse por baixo de todos os reinos ao mesmo tempo." }),
  M("M18", "Yamata", "a Serpente de Oito Vales", 4, "Água", "serpente", "#1a3a3a", "#60c0a0", "vermelho", "Oito cabeças, oito rios envenenados. As lendas dizem que foi morta. As lendas erraram a conta.", { asas: true, calamidade: "Os rios de Yotsuhoshi correm ao contrário por um instante. Rio acima, alguma coisa bebe." }),
  M("M19", "Gashadokuro", "o Esqueleto dos Que Não Foram Enterrados", 4, "Trevas", "cranio", "#d8d0c0", "#8a5ac0", "roxo", "Feito dos ossos de todos os que morreram de fome nas guerras dos quatro reis. Ele lembra de cada um.", { calamidade: "À meia-noite, todos os sinos do mundo tocam sozinhos. Depois, um som de ossos, muito longe e muito alto." }),
  M("M20", "Amanozako", "a Fúria que Caiu do Céu", 4, "Raio", "espirito", "#f0e8ff", "#ffd23a", "dourado", "Uma deusa menor cuspida pela tempestade. Não quer nada. Só não sabe mais parar.", { calamidade: "O céu rasga de leste a oeste num relâmpago que não apaga. Algo desceu por ele." }),
  // Só aparece no evento do Grimório das Sete Luzes (não entra na lista de monstros de cidade nem nas Calamidades)
  M("M21", "Kōryū", "o Dragão da Aurora", 3, "Luz", "serpente", "#cfe4f2", "#f3ead0", "dourado", "Dorme enrolado no topo da geleira desde antes dos quatro reinos. As sete luzes do céu do norte são a respiração dele.", { evento: true, especial: "dragao", asas: true }),
];
export const MONSTRO = new Map(MONSTROS.map((m) => [m.id, m]));
export const dnaMonstro = (m) => ({ id: m.id, tipo: m.tipo, elemento: m.elemento, cor: m.cor, cor2: m.cor2, corOlhos: m.corOlhos, brilhoAura: m.grau >= 3,
  orelhas: m.orelhas, focinho: m.focinho, dentes: m.dentes, crina: m.crina, crista: m.crista, asas: m.asas });
