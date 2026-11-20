# Sources et limites

Le referentiel v2.0.0 s'appuie sur ces references. Il les adapte ; il ne
revendique aucune certification NASA/JPL.

| Reference | Usage dans le referentiel |
|---|---|
| G. J. Holzmann, *The Power of 10: Rules for Developing Safety-Critical Code*, IEEE Computer 39(6), 2006, DOI 10.1109/MC.2006.212 -- https://spinroot.com/gerard/pdf/Power_of_Ten.pdf | Simplicite du flux, bornes, portee des donnees, invariants, analyse statique. L'interdiction d'allouer apres initialisation est remplacee par des limites de ressources et des tests de cycle de vie. |
| JPL D-60411, *JPL Institutional Coding Standard for the C Programming Language*, v1.0, 2009 | Niveaux LOC-1 a LOC-4 : previsibilite, traitement des erreurs, propriete des ressources. |
| NASA-HDBK-2203 (SWEHB), §9.03 *Coding Standards* -- https://swehb.nasa.gov/ | Situe le standard JPL et l'article de Holzmann. |
| NASA NPR 7150.2D, §3.12 et §§4.4-4.5 -- https://nodis3.gsfc.nasa.gov/ | SWE-052 : tracabilite bidirectionnelle. SWE-061, SWE-135 : regles de codage, analyse statique. SWE-062, 186, 065, 066 : tests unitaires, repetabilite, verification des exigences. |
| NASA-STD-8739.8B, 2022 -- https://standards.nasa.gov/ | Revue distincte des changements a fort impact, conservation des preuves. Une revue de projet n'est pas un dispositif institutionnel d'IV&V. |

## Limites documentaires

- Les documents C (D-60411) font partie du contexte historique ; aucune
  obligation directe n'en est derivee pour TypeScript, Python ou Go.
- L'edition publique de D-60411 omet les niveaux LOC-5/6 (MISRA-C:2004) et
  l'annexe sur ISO C.
- La matrice d'adaptation (sources -> exigences -> tests) et le registre des
  derogations du projet d'origine sont conserves hors du VPS ; ils ne sont
  pas necessaires pour appliquer cette skill.
- Les profils Python, Go et Julia n'ont ete evalues sur aucun depot. Le
  profil Node est une correspondance proposee par le socle.
