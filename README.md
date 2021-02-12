## 🐛 Bug report

### Current behavior

I'm using Reakit with next.js SSR. I have a `Provider` around all the Reakit components but any components that generate ids cause a client / server DOM mismatch warning at hydration.

### Steps to reproduce the bug

https://github.com/AndyA/next-redux-reakit-bug

Start an empty next.js app `npx create-next-app` then `npm install reakit`.

Replace pages/index.js with 

```javascript
import { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

import { Provider } from "reakit";
import { unstable_useId as useId } from "reakit/Id";

const log = [];
let seq = 1;

function debug(msg) {
  log.push(`[${new Date().toISOString()}] ${seq++}: ${msg}`);
  while (log.length > 5) log.shift();
  console.log(`\nLog:`);
  for (const ln of log) console.log(`  ${ln}`);
}

function Bug() {
  const { id } = useId();
  const [count, setCount] = useState(0);

  const onClick = e => {
    debug(`Click`);
    e.preventDefault();
    setCount(count + 1);
  };

  const desc = `The id is ${id}`;
  debug(desc);

  return (
    <div id={id}>
      <h1>{desc}</h1>
      {count} <button onClick={onClick}>+</button>
    </div>
  );
}

export default function Home() {
  return (
    <Provider>
      <Bug />
    </Provider>
  );
}
```

On hard reload of the page observe that the server log is

```
Log:
  [2021-02-12T16:10:17.159Z] 1: The id is id-1
```

On the client we get

```
Log:
[2021-02-12T16:10:17.964Z] 1: The id is id-1
Warning: Text content did not match. Server: "The id is id-1" Client: "The id is id-2"
    at h1
    at div
    at Bug (webpack-internal:///./pages/index.js:59:80)
    at SystemProvider (webpack-internal:///./node_modules/reakit-system/es/SystemProvider.js:31:23)
    at unstable_IdProvider (webpack-internal:///./node_modules/reakit/es/Id/IdProvider.js:19:23)
    at Provider (webpack-internal:///./node_modules/reakit/es/Provider.js:13:21)
    at Home
    at MyApp (webpack-internal:///./pages/_app.js:18:24)
    at ErrorBoundary (webpack-internal:///./node_modules/@next/react-dev-overlay/lib/internal/ErrorBoundary.js:23:47)
    at ReactDevOverlay (webpack-internal:///./node_modules/@next/react-dev-overlay/lib/internal/ReactDevOverlay.js:73:23)
    at Container (webpack-internal:///./node_modules/next/dist/client/index.js:149:5)
    at AppContainer (webpack-internal:///./node_modules/next/dist/client/index.js:637:24)
    at Root (webpack-internal:///./node_modules/next/dist/client/index.js:768:24)
printWarning @ react-dom.development.js?61bb:67
error @ react-dom.development.js?61bb:43
warnForTextDifference @ react-dom.development.js?61bb:8807
diffHydratedProperties @ react-dom.development.js?61bb:9543
hydrateInstance @ react-dom.development.js?61bb:10400
prepareToHydrateHostInstance @ react-dom.development.js?61bb:14616
completeWork @ react-dom.development.js?61bb:19458
completeUnitOfWork @ react-dom.development.js?61bb:22815
performUnitOfWork @ react-dom.development.js?61bb:22787
workLoopSync @ react-dom.development.js?61bb:22707
renderRootSync @ react-dom.development.js?61bb:22670
performSyncWorkOnRoot @ react-dom.development.js?61bb:22293
scheduleUpdateOnFiber @ react-dom.development.js?61bb:21881
updateContainer @ react-dom.development.js?61bb:25482
eval @ react-dom.development.js?61bb:26021
unbatchedUpdates @ react-dom.development.js?61bb:22431
legacyRenderSubtreeIntoContainer @ react-dom.development.js?61bb:26020
hydrate @ react-dom.development.js?61bb:26086
renderReactElement @ index.tsx?8abf:521
doRender @ index.tsx?8abf:787
_callee2$ @ index.tsx?8abf:416
tryCatch @ runtime.js?96cf:63
invoke @ runtime.js?96cf:293
eval @ runtime.js?96cf:118
asyncGeneratorStep @ asyncToGenerator.js?c973:3
_next @ asyncToGenerator.js?c973:25
eval @ asyncToGenerator.js?c973:32
eval @ asyncToGenerator.js?c973:21
_render @ index.js:514
render @ index.js:451
eval @ next-dev.js?53bc:85
eval @ fouc.js?937a:14
requestAnimationFrame (async)
displayContent @ fouc.js?937a:5
eval @ next-dev.js?53bc:84
Promise.then (async)
eval @ next-dev.js?53bc:31
eval @ next-dev.js?53bc:31
./node_modules/next/dist/client/next-dev.js @ main.js?ts=1613146217158:945
__webpack_require__ @ webpack.js?ts=1613146217158:873
checkDeferredModules @ webpack.js?ts=1613146217158:46
webpackJsonpCallback @ webpack.js?ts=1613146217158:33
(anonymous) @ webpack.js?ts=1613146217158:1015
(anonymous) @ webpack.js?ts=1613146217158:1023
```

Clicking on the button adds this to the log

```
Log:
[2021-02-12T16:10:17.964Z] 1: The id is id-1
[2021-02-12T16:10:17.965Z] 2: The id is id-2
[2021-02-12T16:10:22.492Z] 3: Click

Log:
[2021-02-12T16:10:17.964Z] 1: The id is id-1
[2021-02-12T16:10:17.965Z] 2: The id is id-2
[2021-02-12T16:10:22.492Z] 3: Click
[2021-02-12T16:10:22.495Z] 4: The id is id-2
```

Not sure if this is diagnostic but it's interesting that we don't see anything logged to the console when the id is updated to `id-2`. That's why I made `debug()` retain the log history. Each time `debug()` is called it shows the last 4 lines of the log - but there's no output to the console for the render that changes the id to `id-2`. We only see event 2 at the same time as event 3 - the click. Not sure if next.js has the console redirected during rehydration for some reason.

### Expected behavior

Generated ids should be stable

### Possible solutions

Unknown.

### Environment

  System:
    OS: macOS 11.1
    CPU: (8) x64 Intel(R) Core(TM) i7-7820HQ CPU @ 2.90GHz
    Memory: 1.25 GB / 16.00 GB
    Shell: 3.2.57 - /bin/bash
  Binaries:
    Node: 15.7.0 - /usr/local/bin/node
    npm: 7.4.3 - /usr/local/bin/npm
  Browsers:
    Chrome: 88.0.4324.150
    Firefox: 80.0.1
    Safari: 14.0.2
  npmPackages:
    react: 17.0.1 => 17.0.1
    react-dom: 17.0.1 => 17.0.1
    reakit: ^1.3.5 => 1.3.5