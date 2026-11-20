/** Interactions du réseau : niveau, hypothèses, panneau de preuve. Données lues dans le tableau. */
export function initNetwork(): void {
  const form = document.querySelector<HTMLFormElement>('#net-controls');
  const panel = document.querySelector<HTMLElement>('#edge-panel');
  if (!form || !panel) return;
  const root = document.documentElement;

  const applyLevel = () => {
    const level = String(new FormData(form).get('level') ?? 'occurrences');
    document.querySelectorAll<HTMLElement>('section.net').forEach((s) => {
      s.hidden = s.dataset['level'] !== level;
    });
    panel.hidden = true;
  };
  const applyToggles = () => {
    const data = new FormData(form);
    root.classList.toggle('show-hypothesis', data.get('hypothesis') === 'on');
    root.classList.toggle('show-rejected', data.get('rejected') === 'on');
  };

  const text = (tag: string, content: string, cls?: string) => {
    const el = document.createElement(tag);
    el.textContent = content;
    if (cls) el.className = cls;
    return el;
  };

  const show = (id: string, g: Element) => {
    const row = document.querySelector<HTMLTableRowElement>(`tr[data-edge-row="${CSS.escape(id)}"]`);
    if (!row) return;
    const ds = row.dataset;
    document.querySelectorAll('.edge.selected').forEach((x) => x.classList.remove('selected'));
    g.classList.add('selected');
    panel.replaceChildren();
    panel.append(text('h3', `${id} — ${ds['category'] ?? ''}`));
    const dl = document.createElement('dl');
    dl.className = 'meta';
    const add = (k: string, v: string | undefined) => {
      if (!v) return;
      dl.append(text('dt', k), text('dd', v));
    };
    add('Relation', `${ds['from']} — ${ds['relation']} — ${ds['to']}`);
    add('Statut', `${ds['status']} : ${ds['evlabel']}`);
    add('Localisateur / portée', ds['locator']);
    add('Témoins', ds['sources']);
    add('Note', ds['note']);
    panel.append(dl);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = `#rel-${id}`;
    a.textContent = 'Voir la ligne du tableau et les liens de preuve';
    p.append(a);
    panel.append(p);
    panel.hidden = false;
  };

  document.querySelectorAll<SVGGElement>('g.edge').forEach((g) => {
    const id = g.dataset['edge'] ?? '';
    g.addEventListener('click', () => show(id, g));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        show(id, g);
      }
    });
  });
  form.addEventListener('change', () => {
    applyLevel();
    applyToggles();
  });
  applyLevel();
  applyToggles();
}
