import { CooklangParser, type CooklangRecipe } from '@cooklang/cooklang';

export interface ParseResult {
  recipe: CooklangRecipe;
  /**
   * The parser's diagnostics as plain text, empty when the source parsed
   * cleanly. The official parser is lenient: malformed markup such as an
   * unclosed `@salt{1%tsp` does not fail, it produces a warning here and the
   * broken component is silently dropped from `recipe`. Callers must treat a
   * non-empty report as a finding, never as success.
   */
  report: string;
  clean: boolean;
}

let parser: CooklangParser | undefined;

/** Parse Cooklang source with the official (cooklang-rs, via WASM) parser. */
export function parseRecipe(source: string): ParseResult {
  parser ??= new CooklangParser();
  const [recipe, rawReport] = parser.parse(source);
  const report = stripMarkup(rawReport).trim();
  return { recipe, report, clean: report === '' };
}

// The parser renders its report with <span style=...> colour markup for its
// web playground. Keep the text, drop the tags.
function stripMarkup(report: string): string {
  return report.replace(/<[^>]*>/g, '');
}
