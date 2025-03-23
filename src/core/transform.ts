import path from "node:path";
import MagicString from "magic-string";
import { parseAsync } from "oxc-parser";
import { relative } from "pathe";
import { seekMockComment } from "./comment";
import { lookupSpecifierWithOptions } from "./resolver";
import type { Visit } from "./walker";
import { Walker } from "./walker";

export async function transform(code: string, id: string) {
  const parseResult = await parseAsync(id, code).catch(() => null);

  const mockComments = await seekMockComment(parseResult?.comments ?? []);
  if (!mockComments.length) {
    return null;
  }

  const ms = new MagicString(code);
  const importIdentifiers = Array.from(
    new Set(mockComments.flatMap((mc) => mc.importIdentifiers)),
  );
  if (importIdentifiers.length) {
    const foundFilePath = await lookupSpecifierWithOptions(id);
    if (foundFilePath) {
      let relativePath = relative(path.dirname(id), foundFilePath);
      if (!relativePath.startsWith(".")) {
        relativePath = `./${relativePath}`;
      }
      const index = parseResult!.module?.staticImports?.[0]?.start ?? 0;
      ms.appendLeft(
        index,
        `import { ${importIdentifiers.join(", ")} } from '${relativePath}'\n`,
      );
    }
  }
  const programBody = parseResult!.program.body;
  let bodyIndex = 0;
  for (const comment of mockComments) {
    const { end, selfIdentifiers } = comment;
    while (bodyIndex < programBody.length) {
      const statement = programBody[bodyIndex];
      if (statement.end < end) {
        bodyIndex++;
        continue;
      }
      const expressionRange: { start: number; end: number }[] = [];
      await new Walker(
        statement,
        statementVisitorFactory(end, expressionRange),
      ).walk();
      for (const range of expressionRange) {
        let overwriteCode = comment.code;
        if (selfIdentifiers.length) {
          const selfCode = code.slice(range.start, range.end);
          overwriteCode = selfIdentifiers
            .reduce(
              (commentMs, curr) =>
                commentMs.overwrite(curr.start, curr.end, selfCode),
              new MagicString(comment.code),
            )
            .toString();
        }
        ms.overwrite(range.start, range.end, overwriteCode);
      }
      break;
    }
  }

  return {
    code: ms.toString(),
    map: ms.generateMap({ source: id, includeContent: true, hires: true }),
  };
}

function statementVisitorFactory(
  nextLineIndex: number,
  collection: { start: number; end: number }[],
): {
  enter: Visit;
  AssignmentExpression: Visit;
  VariableDeclaration: Visit;
  ArrowFunctionExpression: Visit;
  ReturnStatement: Visit;
  Property: Visit;
  Literal: Visit;
  Identifier: Visit;
} {
  let found = false;
  return {
    enter(node, _p, _k, _index, ctx) {
      if (node.start > nextLineIndex) {
        found = true;
        if (
          ![
            "ExpressionStatement",
            "ExportNamedDeclaration",
            "ExportDefaultDeclaration",
          ].includes(node.type)
        ) {
          ctx.stop();
        }
      }
    },
    AssignmentExpression(node) {
      if (!found) return;
      const targetNode = node.right;
      if (targetNode) {
        collection.push({ start: targetNode.start, end: targetNode.end });
      }
    },
    VariableDeclaration(node) {
      if (!found) return;
      for (const declarator of node.declarations) {
        if (declarator.init) {
          collection.push({
            start: declarator.init.start,
            end: declarator.init.end,
          });
        }
      }
    },
    ArrowFunctionExpression(node) {
      if (!found) return;
      const targetNode = node.body;
      if (targetNode) {
        collection.push({ start: targetNode.start, end: targetNode.end });
      }
    },
    ReturnStatement(node) {
      if (!found) return;
      const targetNode = node.argument;
      if (targetNode) {
        collection.push({ start: targetNode.start, end: targetNode.end });
      }
    },
    Property(node) {
      if (!found) return;
      const targetNode = node.value;
      collection.push({ start: targetNode.start, end: targetNode.end });
    },
    Literal(node, parent) {
      if (
        !found ||
        ["ImportDeclaration", "ExportNamedDeclaration"].includes(parent?.type)
      )
        return;
      const targetNode = node;
      collection.push({ start: targetNode.start, end: targetNode.end });
    },
    Identifier(node) {
      if (!found) return;
      const targetNode = node;
      collection.push({ start: targetNode.start, end: targetNode.end });
    },
  };
}
