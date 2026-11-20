/** Filtrage local du corpus. Les décomptes v0.4 et v0.5 restent séparés. */
export function filterCorpus(): void {
  const form = document.querySelector<HTMLFormElement>('#filters');
  const count = document.querySelector<HTMLElement>('#count');
  if (!form || !count) return;

  const apply = () => {
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    const q = get('q').toLowerCase();
    const from = get('from') ? Number(get('from')) : null;
    const to = get('to') ? Number(get('to')) : null;
    const char = get('char');
    const area = get('area');
    const medium = get('medium');
    const grade = get('grade');
    const family = get('family');
    const shown: Record<string, number> = {};
    const total: Record<string, number> = {};

    document.querySelectorAll<HTMLTableElement>('table[data-table]').forEach((table) => {
      const key = table.dataset['table'] ?? '';
      let n = 0;
      const rows = table.querySelectorAll<HTMLTableRowElement>('tr[data-row]');
      rows.forEach((tr) => {
        const ds = tr.dataset;
        const start = ds['start'] ? Number(ds['start']) : null;
        const end = ds['end'] ? Number(ds['end']) : null;
        const ok =
          (!q || (ds['text'] ?? '').includes(q)) &&
          (from === null || (end !== null && end >= from)) &&
          (to === null || (start !== null && start <= to)) &&
          (!char || (ds['chars'] ?? '').split(' ').includes(char)) &&
          (!area || ds['area'] === area) &&
          (!medium || ds['medium'] === medium) &&
          (!grade || ds['grade'] === grade) &&
          (!family || ds['family'] === family);
        tr.hidden = !ok;
        if (ok) n += 1;
      });
      shown[key] = n;
      total[key] = rows.length;
      const empty = document.querySelector<HTMLElement>(`[data-empty="${key}"]`);
      if (empty) empty.hidden = n !== 0;
    });
    count.textContent =
      `${shown['v05'] ?? 0} témoin(s) v0.5 sur ${total['v05'] ?? 0} · ` +
      `${shown['v04'] ?? 0} notice(s) v0.4 sur ${total['v04'] ?? 0} (corpus non additionnés)`;
  };

  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('reset', () => setTimeout(apply, 0));
  form.addEventListener('submit', (e) => e.preventDefault());
  apply();
}
