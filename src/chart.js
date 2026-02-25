import { Div, state, resolve, after, isState, isStatePath, isSignal } from '@granularjs/core';
import * as d3 from 'd3';

const isReactive = (v) =>
  isState(v) || isStatePath(v) || isSignal(v) ||
  (v != null && typeof v === 'object' && typeof v.subscribe === 'function' && typeof v.after === 'function');

export function chart(data, options = {}) {
  const nodeRef = state(null);

  const run = () => {
    const el = nodeRef.get();
    if (!el) return;
    if (options.node && (isState(options.node) || isStatePath(options.node))) options.node.set(el);
    const draw = options.draw;
    if (typeof draw === 'function') draw(d3.select(el), resolve(data) ?? [], options);
  };

  after(nodeRef).change(run);
  if (isReactive(data)) after(data).change(run);

  const props = {
    node: nodeRef,
    className: options.className ?? 'g-d3',
  };
  for (const key of Object.keys(options)) {
    if (['draw', 'data', 'node', 'className'].includes(key)) continue;
    props[key] = options[key];
  }

  return Div(props);
}

export { d3 };
