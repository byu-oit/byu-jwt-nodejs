# Packages

This repository hosts the following Node.js packages for API development at BYU OIT:

- [@byu-oit/jwt](./packages/jwt/README.md)
- [@byu-oit/fastify-jwt](./packages/fastify-jwt/README.md)

The documentation and source code for previous versions of the byu-jwt package are found on
the [v3 branch](https://github.com/byu-oit/byu-jwt-nodejs/tree/v3) in this repository.

> **Note**
> **Requires Node.js >= v18 *OR* a fetch polyfill such as [node-fetch](https://www.npmjs.com/package/node-fetch#providing-global-access).**

# Contributing

This project uses [Lerna](https://lerna.js.org) with [Nx](https://nx.dev) to build, test, and lint the source code.
Please consult their documentation when making modifications to the maintenance process of this project.

There are a few commands that most of the packages share:

- **build**: Compile the distribution code
- **lint**: Lint the source code
- **test**: Test the source code with [Ava](https://avajs.dev)

If you notice a problem, please submit an issue or create a PR with the fix!

## Committing

Commit messages must adhere to
the [angular conventional commit standard](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum).
[`commitlint`](https://github.com/conventional-changelog/commitlint) will enforce commit messages to follow this
standard. Following a commit standard enables our distribution pipeline to publish new versions of each package
automatically.

## Building

This library exposes files in
[both CJS and ESM syntax](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) in order to accommodate
browser environments and legacy NodeJS applications. CJS support may be dropped in the future but is supported for the
time being.

There are two ways that we know of to support both CJS and ESM syntax:

1. Create a localized `package.json` file in each packages' `cjs` directory with the contents `{ type: 'commonjs' }`.
   This effectively overwrites the package's own `package.json` which is set to `module`.

   Node Resolution
   Algorithm: [See ESM_FILE_FORMAT](https://nodejs.org/dist/latest-v18.x/docs/api/esm.html#resolver-algorithm-specification)

   ESM & CommonJS Module Tutorial: https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html

2. Use a tool such as [unbuild](https://github.com/unjs/unbuild) which outputs files with the `.cjs` and `.mjs`
   extensions.

   Example of Using `unbuild`: https://github.com/unjs/radix3/blob/main/package.json

   MDN Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

This library uses the first method for two reasons:

1. Some tools may never support the `.mjs` extension
2. `(package.json).type` is more deterministic since the resolution algorithm is built into node and bundlers.

## Testing

The choice to use [Ava](https://avajs.dev) was made because it

1. supports TypeScript and ESM out of the box
2. parallelizes tests in separate environments making it typically faster
3. does not mutate nodejs globals like Jest
4. follows a similar convention as the node test runner which we may adopt eventually

Running tests requires building the source code first, which should be handled for you by lerna.

From the root of the project you can run:

```shell
npm test
```

Or you can run the following from anywhere within the project.

```shell
# use npx if you don't want to install lerna globally
npx lerna run test
```

> **Note**
> There is a bug in NodeJS Worker threads which requires us to use the `--no-worker-threads` flag when running tests.
> Even with that flag enabled, some tests run into this bug. There isn't a bug report for the issue yet
> (See [this discussion](https://github.com/avajs/ava/discussions/3191#discussioncomment-5571590)).

## Publishing

Merging changes into the `main` branch will automatically update the version of each package, publish the package, and
publish the changelog according to the [commit messages](#Committing).

Merging changes into the `beta` branch will trigger the same GitHub workflow but the `beta` prefix will be prepended to
the new versions published.

The `publish` workflow was heavily inspired by the
article ["Automatic versioning in a Lerna monorepo using Github actions"](https://dev.to/xcanchal/automatic-versioning-in-a-lerna-monorepo-using-github-actions-4hij)
by [Xavier Canchal](https://dev.to/xcanchal) :clap:.

## Documentation & Linting

Writing SDKs with [TypeScript](https://www.typescriptlang.org/) and [TSDocs](https://tsdoc.org/) provides consumers with
the code and documentation all from their development environments. To that end, running the linter without documenting
code with TSDocs style documentation (similar to JSDocs or JavaDocs), will return a non-zero exit code.
