import { importSync, moduleExists } from '@embroider/macros';

type FetchFunction = (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

let _fetch: (() => FetchFunction) | null = null;
const isFastBoot = typeof FastBoot !== 'undefined';

export default function getFetchFunction(): FetchFunction {
  if (_fetch !== null) {
    return _fetch();
  }

  if (isFastBoot) {
    try {
      let fetchFn = FastBoot.require('fetch') as FetchFunction;
      _fetch = () => fetchFn;
    } catch {
      let fetchFn = importSync('fetch') as FetchFunction;
      _fetch = () => fetchFn;
    }
  } else {
    if (moduleExists('fetch')) {
      let fetchFn = (importSync('fetch') as { default: FetchFunction }).default;
      _fetch = () => fetchFn;
    } else if (moduleExists('ember-fetch')) {
      let fetchFn = (importSync('fetch') as { default: FetchFunction }).default;
      _fetch = () => fetchFn;
    } else if (typeof fetch === 'function') {
      // fallback to using global fetch
      _fetch = () => fetch;
    } else {
      throw new Error(
        'cannot find the `fetch` module or the `fetch` global. Did you mean to install the `ember-fetch` addon?'
      );
    }
  }

  return _fetch();
}
