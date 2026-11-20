/**
 * Textes éditoriaux des fiches personnages. Chaque phrase se rattache au
 * corpus (IDs cités) ou est explicitement marquée comme limite.
 */
export interface CharacterText {
  summary: string;
  distinctions: string[];
  limits: string;
}

export const CHARACTER_TEXT: Record<string, CharacterText> = {
  C_NICHOLAS: {
    summary:
      'Évêque de Myre, figure hagiographique. Le registre v0.4 réunit des objets médiévaux (D001–D004) qui le montrent en évêque et en protecteur. Dans le récit de 1897 (S10), consulté en traduction, il vient le 6 décembre accompagné de Krampus.',
    distinctions: [
      'Krampus l’accompagne (X02), ce qui n’en fait pas le même personnage : l’accompagnement n’est jamais une identité.',
      'Le poème de 1823 porte le titre « St. Nicholas ». Le rattacher à Santa Claus relève d’une convention ultérieure, que l’occurrence O03_SANTA documente comme telle.',
    ],
    limits: 'Les objets médiévaux sont datés de façon approximative. Aucun ne documente une pratique de distribution de cadeaux.',
  },
  C_SINTERKLAAS: {
    summary:
      'Forme néerlandaise de saint Nicolas. Dans le livre de Schenkman (1850, S04), d’après la notice de la KB, il circule à cheval sur les toits, a une fonction éducative et vient avec un serviteur.',
    distinctions: ['Le serviteur est une occurrence distincte (O04_SERVANT) qui l’accompagne (X03), pas une forme de Sinterklaas.'],
    limits: 'L’analyse repose sur la description experte de la KB : les planches n’ont pas été dépouillées une à une.',
  },
  C_SANTA_CLAUS: {
    summary:
      'Figure américaine du XIXe siècle. Le corpus atteste notamment les rennes et les dons en 1821 (S02), huit rennes et la cheminée dans une recension moderne du poème de 1823 (S03), puis une grande diversité d’images : automobile en 1904 (S08), arme dans une satire de 1912 (S09).',
    distinctions: [
      'Dans Karl Krinken (édition 1878, S07), Santa Claus et Father Christmas sont deux occurrences distinctes du même livre (X01).',
      'Rudolph est un personnage associé, jamais Santa (X04, rejeté).',
      'Le manteau rouge n’est attesté dans aucun des textes de 1821 et 1823 consultés : il y reste indéterminé, ce qui ne veut pas dire absent.',
    ],
    limits: 'Les images de 1904 et 1912 montrent la diversité du répertoire des images, pas la pratique familiale ordinaire.',
  },
  C_FATHER_CHRISTMAS: {
    summary:
      'Personnification anglaise de la fête. Le masque de Ben Jonson (S01) est daté avec prudence : le témoin Folger porte 1615 et la représentation est probable en 1616–1617. Dans Karl Krinken (1878, S07), il apparaît vêtu de brun et couronné de lierre lors d’une mascarade.',
    distinctions: [
      'Dans le même livre (S07), il est distinct de Santa Claus (X01).',
      'Aucune descendance directe entre l’occurrence de Jonson et celle de 1878 n’est documentée (X05, indéterminée).',
    ],
    limits: 'Selon la Library of Congress, Father Christmas et Santa Claus ont fusionné en Angleterre au XIXe siècle. Le corpus ne mesure pas cette fusion.',
  },
  C_PERE_NOEL: {
    summary:
      'Usage français. Le corpus n’en contient qu’un témoin : le souvenir d’enfance de George Sand, publié en 1855 (S05), avec soulier, cheminée, barbe blanche et visite à minuit.',
    distinctions: ['Le registre v0.4 classait ce témoin sous « Santa ». La v0.5.1 le rattache au Père Noël, selon la désignation du témoin.'],
    limits: 'C’est un souvenir rétrospectif : il ne date pas exactement le rituel vécu et ne prouve pas l’uniformité d’une pratique française.',
  },
  C_KNECHT: {
    summary:
      'Serviteur qui accompagne Sinterklaas dans le livre de Schenkman (1850, S04). D’après la KB, il est anonyme dans l’ouvrage.',
    distinctions: ['Le nom « Zwarte Piet » n’apparaît pas dans ce livre d’après la KB (V05A022, négation au niveau du catalogue). Cela ne dit rien des usages ultérieurs.'],
    limits: 'La représentation d’une servitude racialisée doit être contextualisée historiquement, sans lui prêter un rôle intemporel.',
  },
  C_KRAMPUS: {
    summary:
      'Type pluralisable de compagnon punitif. Le récit de 1897 (S10, en traduction) le montre accompagnant saint Nicolas. Le registre v0.4 ajoute des articles de presse de 1905 à 1914 (D049–D051).',
    distinctions: ['Krampus n’est pas le Père Noël, ni saint Nicolas : l’accompagnement (X02) n’est pas une identité.'],
    limits: 'La traduction ne remplace pas l’original de 1897. Elle ne permet pas d’établir une généalogie démoniaque antérieure.',
  },
  C_PERE_FOUETTARD: {
    summary: 'Aucun témoin du corpus v0.4 ou v0.5 ne documente le Père Fouettard.',
    distinctions: ['Ne pas l’assimiler par défaut à Krampus ni au serviteur de Sinterklaas : aucune source du corpus ne le permet.'],
    limits: 'Cette fiche est vide par honnêteté documentaire, pas par oubli.',
  },
  C_RUDOLPH: {
    summary: 'Renne créé en 1939 par Robert L. May dans un livret promotionnel (S11, notice du Smithsonian).',
    distinctions: ['Rudolph est un personnage associé à l’univers de Santa Claus, pas une nouvelle forme du Père Noël (X04, identité rejetée).'],
    limits: 'Le livret est sous droits : il n’a pas été dépouillé intégralement et rien n’en est reproduit.',
  },
};
