/**
 * Validation scientifique bloquante des données publiées (avant `astro build`).
 * Code de sortie 1 si une règle échoue. Une ligne par règle, lisible en CI et
 * dans les logs du worker.
 */
import { loadDataset } from '../src/lib/data.ts';
import { validateDataset } from '../src/lib/validate.ts';

let failed = false;
try {
  const report = validateDataset(loadDataset());
  for (const [name, ok] of Object.entries(report.checks)) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  for (const e of report.errors) console.error(`  ${e}`);
  failed = report.errors.length > 0;
  console.log(`validate: ${failed ? 'FAIL' : 'PASS'} (${Object.keys(report.checks).length} règles)`);
} catch (err) {
  console.error(`validate: FAIL — ${err instanceof Error ? err.message : String(err)}`);
  failed = true;
}
process.exit(failed ? 1 : 0);
