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
