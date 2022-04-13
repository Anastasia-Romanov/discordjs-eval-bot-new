import * as babel from '@babel/core';
import { stripIndents } from 'common-tags';
import * as Discord from 'discord.js';
import * as assert from 'node:assert/strict';
import * as util from 'node:util';
import prelude from './prelude';

export interface EvalFlags {
  /** Manually resolve or reject the function */
  wait: boolean;
  /** Use Discord's built-in highlighting (e.g. for mobile) */
  'no-ansi': boolean;
  /** Execute the code but don't response */
  silent: boolean;
  /** Result inspector depth */
  depth: number;
  /** Show error stacks on throw */
  stack: boolean;
  /** Makes the result inspector show everything on one line */
  compact: boolean;
}

export type CompiledEval = (
  exports: Record<string, unknown>,
  require: NodeRequire,
  __filename: string,
  __dirname: string,
  opts: {
    client: Discord.Client;
    message: Discord.Message;
    args: string[];
    flags: EvalFlags;
    prefix: { get: () => unknown; set: (value: unknown) => void };
    compileEval: typeof compileEval;
    require: NodeRequire;
  }
) => Promise<unknown>;

const babelOptions: babel.TransformOptions = {
  plugins: [
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-async-do-expressions',
    '@babel/plugin-transform-typescript',
    [
      '@babel/plugin-transform-modules-commonjs',
      {
        strict: true,
      },
    ],
  ],
  filename: '<eval>.ts',
  parserOpts: {
    allowImportExportEverywhere: true,
    strictMode: false,
    attachComment: false,
  },
};

export async function prepareCompiler() {
  // loads plugins so that future transforms are faster
  await babel.transformAsync('', babelOptions);
}

export async function compileEval(code: string, flags: EvalFlags) {
  try {
    const transformResult = await babel.transformAsync(
      stripIndents`
        ${prelude}

        export default ${
          flags.wait
            ? stripIndents`
                new Promise((resolve, reject) => {
                  (async do {
                    ${code}
                  }).catch(reject);
                });
              `
            : stripIndents`
                async do {
                  ${code}
                };
              `
        }
      `,
      babelOptions
    );

    assert.ok(transformResult?.code);

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const compiled = new Function(
      'exports',
      'require',
      '__filename',
      '__dirname',
      transformResult.code
    ) as CompiledEval;

    return compiled;
  } catch (err) {
    assert.ok(err instanceof Error);

    // babel errors have escape codes and we may need to remove them
    if (flags['no-ansi']) {
      err.message = util.stripVTControlCharacters(err.message);
      if (err.stack) err.stack = util.stripVTControlCharacters(err.stack);
    }

    throw err;
  }
}
