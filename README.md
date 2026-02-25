# @granularjs/d3

D3.js encapsulation for [GranularJS](https://github.com/zerobytes/granular). Charts are plain components: they return a `Div` with a node ref and subscribe to data. When data changes, only the chart redraws—no re-render, no VDOM.

**Dependencies:** only **d3**. Granular is a peer (and dev) dependency; the app must install `@granularjs/core`.

## Install

```bash
npm install @granularjs/d3 d3 @granularjs/core
```

## Usage

### Basic chart (static data)

```js
import { Div } from '@granularjs/core';
import { chart, d3 } from '@granularjs/d3';

const data = [4, 8, 15, 16, 23, 42];

const BarChart = () =>
  Div(
    { style: { width: 400, height: 200 } },
    chart(data, {
      draw(selection, data) {
        const scale = d3.scaleLinear().domain([0, d3.max(data)]).range([0, 200]);
        selection
          .selectAll('rect')
          .data(data)
          .join('rect')
          .attr('x', (_, i) => i * 40)
          .attr('y', (d) => 200 - scale(d))
          .attr('width', 36)
          .attr('height', (d) => scale(d))
          .attr('fill', 'steelblue');
      },
    })
  );
```

The container is a `div`. Your `draw` receives `d3.select(container)`; append an `svg` (or any structure) inside it.

### Reactive data

Pass `state`, `signal`, or `observableArray` as the first argument. The chart subscribes via `after(data).change(...)` and redraws when data changes.

```js
import { state, Div, Button } from '@granularjs/core';
import { chart, d3 } from '@granularjs/d3';

const App = () => {
  const values = state([4, 8, 15, 16, 23, 42]);

  return Div(
    chart(values, {
      draw(selection, data) {
        const scale = d3.scaleLinear().domain([0, d3.max(data)]).range([0, 200]);
        selection
          .selectAll('rect')
          .data(data ?? [])
          .join('rect')
          .attr('x', (_, i) => i * 40)
          .attr('y', (d) => 200 - scale(d))
          .attr('width', 36)
          .attr('height', (d) => scale(d))
          .attr('fill', 'steelblue');
      },
    }),
    Button({ onClick: () => values.set([...values.get(), Math.random() * 50]) }, 'Add value')
  );
};
```

### API

- **`chart(data, options)`**  
  Returns a **Div** (use as a child of any Granular tag). The div gets a `node` ref; when it mounts, `draw` runs. When `data` is reactive, `after(data).change(run)` triggers redraws.
  - **data** — array (static) or reactive source (`state`, `signal`, observableArray). Resolved with `resolve(data)`; reactive sources are subscribed with `after(data).change(run)`.
  - **options**:
    - **`draw(selection, data, options)`** — `(d3.Selection, resolvedData, options) => void`. Called when the node is mounted and on every data change when data is reactive. The selection is the container `div`.
    - **`className`** — default `'g-d3'`.
    - **`node`** — optional. A `state` or `signal`; the container element is set on it when available.
    - Any other keys (e.g. `style`, `onClick`) are passed as props to the container `Div`.

- **`d3`** — re-export of the `d3` package for scales, axes, shapes, etc.

## Principles (aligned with Granular)

- **Plain component** — `chart()` is a function that returns a `Div`, like any other Granular component. No custom Renderable; it uses the core `node` prop and `after(...).change()`.
- **Component runs once** — your component that returns `chart(...)` runs once; redraws are driven by `after(nodeRef).change(run)` and `after(data).change(run)` when data is reactive.
- **Explicit reactivity** — only reactive sources trigger redraws; plain arrays draw once (when the node mounts).
- **No extra dependencies** — runtime dependency is only `d3`; Granular is peer/dev.
