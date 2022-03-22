import { createSignal } from "solid-js";

export function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  return (
    <div>
      <button type="button" onClick={increment}>
        a{count()}
      </button>
    </div>
  );
}
