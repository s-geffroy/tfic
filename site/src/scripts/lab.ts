/** Démonstrations du laboratoire (client). Aucune donnée n'est envoyée. */
import { DEMO_TRAITS } from '../lib/lab-defaults.ts';
import { findIntransitiveTriple, near, weightedDistance, type TraitValue } from '../lib/similarity.ts';

const fmt = (x: number, d = 3) => x.toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: 0 });

function para(text: string, strong = false): HTMLElement {
  const p = document.createElement('p');
  if (strong) {
    const s = document.createElement('strong');
    s.textContent = text;
    p.append(s);
  } else p.textContent = text;
  p.style.margin = '0.2rem 0';
  return p;
}

function onChange(form: HTMLFormElement, run: () => void) {
  form.addEventListener('input', run);
  form.addEventListener('change', run);
  form.addEventListener('reset', () => setTimeout(run, 0));
  form.addEventListener('submit', (e) => e.preventDefault());
  run();
}

function demo1() {
  const form = document.querySelector<HTMLFormElement>('form#demo1');
  const out = document.querySelector<HTMLOutputElement>('#demo1-out');
  const exp = document.querySelector<HTMLButtonElement>('#demo1-export');
  if (!form || !out) return;
  const read = () => {
    const data = new FormData(form);
    const val = (k: string): TraitValue => {
      const v = String(data.get(k) ?? 'unknown');
      return v === 'unknown' ? null : v === 'yes';
    };
    const specs = DEMO_TRAITS.map((t) => ({ ...t, weight: Math.max(0, Number(data.get(`w-${t.key}`) ?? t.weight) || 0) }));
    const A: Record<string, TraitValue> = {};
    const B: Record<string, TraitValue> = {};
    for (const t of DEMO_TRAITS) {
      A[t.key] = val(`A-${t.key}`);
      B[t.key] = val(`B-${t.key}`);
    }
    return { specs, A, B };
  };
  const run = () => {
    const { specs, A, B } = read();
    const r = weightedDistance(specs, A, B);
    out.replaceChildren();
    if (r.distance === null) {
      out.append(para('Calcul refusé : aucun trait n’est renseigné des deux côtés (K vide).', true));
    } else {
      out.append(para(`Distance d_w = ${fmt(r.distance)} · couverture κ = ${fmt(r.coverage * 100, 0)} % (${r.compared.length}/${specs.length} traits comparés)`, true));
      if (r.coverage < 0.5) out.append(para('Couverture faible : la distance repose sur peu de traits. Il faut l’interpréter avec prudence.'));
    }
    out.append(para('Exemple synthétique : cette distance ne crée aucune relation et ne prouve aucune filiation.'));
  };
  onChange(form, run);
  exp?.addEventListener('click', () => {
    const { specs, A, B } = read();
    const payload = {
      nature: 'EXEMPLE_SYNTHETIQUE — pas une observation historique',
      genere_par: 'TFIC-PN laboratoire, démonstration 1',
      traits: specs.map(({ key, kind, weight }) => ({ key, kind, weight })),
      figure_A: A,
      figure_B: B,
      resultat: weightedDistance(specs, A, B),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tfic-pn-exemple-synthetique.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
}

function demo2() {
  const form = document.querySelector<HTMLFormElement>('form#demo2');
  const out = document.querySelector<HTMLOutputElement>('#demo2-out');
  if (!form || !out) return;
  onChange(form, () => {
    const data = new FormData(form);
    const n = (k: string) => Number(data.get(k));
    const [a, b, c, tau] = [n('a'), n('b'), n('c'), Math.max(0, n('tau'))];
    const steps = Math.min(40, Math.max(2, Math.round(n('n')) || 2));
    out.replaceChildren();
    const yes = (x: boolean) => (x ? 'proches' : 'non proches');
    out.append(para(`a~b : ${yes(near(a, b, tau))} · b~c : ${yes(near(b, c, tau))} · a~c : ${yes(near(a, c, tau))}`));
    const t = findIntransitiveTriple([a, b, c], tau);
    out.append(
      para(
        t
          ? `Non-transitivité exhibée : ${fmt(t[0])} ~ ${fmt(t[1])} et ${fmt(t[1])} ~ ${fmt(t[2])}, mais ${fmt(t[0])} ≁ ${fmt(t[2])}.`
          : 'Pas de contre-exemple avec ces trois valeurs : essayez d’écarter a et c.',
        true,
      ),
    );
    const chain = Array.from({ length: steps + 1 }, (_, i) => i * tau);
    const last = chain[chain.length - 1] ?? 0;
    out.append(
      para(
        `Chaîne : ${steps} pas de ${fmt(tau)} relient 0 à ${fmt(last)}. Chaque maillon est « proche » du suivant, mais les extrémités sont à ${fmt(last)} l’une de l’autre, soit ${fmt(steps)} fois le seuil.`,
      ),
    );
  });
}

function demo4() {
  const form = document.querySelector<HTMLFormElement>('form#demo4');
  const out = document.querySelector<HTMLOutputElement>('#demo4-out');
  if (!form || !out) return;
  onChange(form, () => {
    const data = new FormData(form);
    const rel = String(data.get('rel'));
    const status = String(data.get('status'));
    out.replaceChildren();
    if (rel === 'same_character') {
      if (status === 'REJECTED') {
        out.append(para('Accepté comme contrôle négatif : « Krampus = Nicolas » est enregistré comme rejeté.', true));
      } else {
        out.append(para('Refusé par la validation : une identité impliquant un compagnon ne peut être que REJECTED.', true));
        out.append(para('Le témoin S10 montre deux figures présentes en même temps. Ce qu’il atteste, c’est un accompagnement, pas une identité.'));
      }
    } else if (rel === 'accompanied_by') {
      out.append(para(status === 'SUPPORTED_TRANSLATION' ? 'Accepté : relation X02, attestée dans la traduction.' : `Accepté avec le statut ${status}.`, true));
      out.append(para('Aucune identité n’en est déduite : la conversion automatique accompanied_by → same_character est interdite.'));
    } else {
      out.append(para('Accepté : les deux figures sont distinctes dans le témoin (assertion V05A043).', true));
    }
  });
}

export function initLab(): void {
  demo1();
  demo2();
  demo4();
}
