/**
 * A tiny, dependency-free tokenizer for the code listings shown next to the
 * visualization. Pure function: a line of source in, typed tokens out. No
 * React, no DOM, no stores.
 *
 * It is deliberately shallow — enough to colour keywords, numbers, strings,
 * comments and call names in short teaching listings, and never enough to be
 * mistaken for a parser.
 */

export type TokenKind = "keyword" | "number" | "string" | "comment" | "fn" | "punct" | "plain";

export interface CodeToken {
  text: string;
  kind: TokenKind;
}

const KEYWORDS = new Set([
  // JS / TS
  "function",
  "const",
  "let",
  "var",
  "return",
  "if",
  "else",
  "while",
  "for",
  "of",
  "in",
  "break",
  "continue",
  "new",
  "class",
  "export",
  "default",
  "import",
  "from",
  "typeof",
  "true",
  "false",
  "null",
  "undefined",
  "number",
  "string",
  "boolean",
  // Python
  "def",
  "elif",
  "None",
  "True",
  "False",
  "not",
  "and",
  "or",
  "pass",
  "lambda",
  "range",
  "len",
]);

const IDENT = /[A-Za-z_$][\w$]*/;

/** Splits one source line into coloured tokens. */
export function tokenizeLine(line: string): CodeToken[] {
  const out: CodeToken[] = [];
  let rest = line;

  const push = (text: string, kind: TokenKind): void => {
    if (text === "") return;
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ text, kind });
  };

  while (rest.length > 0) {
    // comments run to end of line
    if (rest.startsWith("//") || rest.startsWith("#")) {
      push(rest, "comment");
      break;
    }

    const quote = rest[0];
    if (quote === '"' || quote === "'" || quote === "`") {
      const end = rest.indexOf(quote, 1);
      const text = end === -1 ? rest : rest.slice(0, end + 1);
      push(text, "string");
      rest = rest.slice(text.length);
      continue;
    }

    const num = /^\d+(\.\d+)?/.exec(rest);
    if (num) {
      push(num[0], "number");
      rest = rest.slice(num[0].length);
      continue;
    }

    const ident = new RegExp(`^${IDENT.source}`).exec(rest);
    if (ident) {
      const word = ident[0];
      const after = rest.slice(word.length);
      if (KEYWORDS.has(word)) push(word, "keyword");
      else if (after.startsWith("(")) push(word, "fn");
      else push(word, "plain");
      rest = after;
      continue;
    }

    const punct = /^[^\w\s$]+/.exec(rest);
    if (punct) {
      push(punct[0], "punct");
      rest = rest.slice(punct[0].length);
      continue;
    }

    push(rest[0] ?? "", "plain");
    rest = rest.slice(1);
  }

  return out;
}
