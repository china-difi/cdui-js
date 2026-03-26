import { JSX } from '../jsx';
import { animateScrollTo } from '../animate-scroll-to';
import {
  batch,
  combineClass,
  createEffect,
  createMemo,
  createSignal,
  omitProps,
  onCleanup,
  onMount,
  untrack,
} from '../reactive';

import { For } from './For';
import { parseDate } from './Canlendar';

const ITEM_HEIGHT = 44;
const VIEWPORT_ROWS = 5;
/** 上下各多渲染的行数，保证快速滑动时不断档 */
const ROW_OVERSCAN = 5;
const REPEAT_BLOCKS = 99;
const TELEPORT_SHIFT = 35;

const PAD = ((VIEWPORT_ROWS * ITEM_HEIGHT - ITEM_HEIGHT) / 2) | 0;

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

type LoopColumnProps = {
  class?: string;
  values: readonly number[];
  value: () => number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  /**
   * 额外依赖，用于在同长度列表变化时（如换月）重置滚动位置
   */
  scrollToken?: () => void;
};

type VisibleRow = { r: number; v: number };

/**
 * 单列循环滚动（年 / 月 / 日），可视区域虚拟化，仅挂载少量行节点
 */
const MobileDateLoopColumn = (props: LoopColumnProps) => {
  let wheelEl: HTMLDivElement;
  let teleporting = false;
  let settleTimer: ReturnType<typeof setTimeout>;
  let dragging = false;
  let scrollRaf = 0;

  const [scrollTop, setScrollTop] = createSignal(0);

  const blockHeight = () => props.values.length * ITEM_HEIGHT;

  const rowCount = () => {
    const n = props.values.length;
    return n ? REPEAT_BLOCKS * n : 0;
  };

  const innerHeightPx = () => {
    const rc = rowCount();
    return rc ? PAD * 2 + rc * ITEM_HEIGHT : PAD * 2;
  };

  const visibleRows = createMemo((): VisibleRow[] => {
    const vals = props.values;
    const n = vals.length;
    const rc = rowCount();
    if (!n || !rc) {
      return [];
    }

    const st = scrollTop();
    const ch = VIEWPORT_ROWS * ITEM_HEIGHT;
    const y0 = st;
    const y1 = st + ch;
    let r0 = Math.floor((y0 - PAD) / ITEM_HEIGHT) - ROW_OVERSCAN;
    let r1 = Math.ceil((y1 - PAD) / ITEM_HEIGHT) + ROW_OVERSCAN;
    if (r0 < 0) {
      r0 = 0;
    }
    if (r1 > rc - 1) {
      r1 = rc - 1;
    }

    const out: VisibleRow[] = [];
    for (let r = r0; r <= r1; r++) {
      out.push({ r, v: vals[r % n] });
    }

    return out;
  });

  const flushScrollTop = () => {
    if (wheelEl) {
      setScrollTop(wheelEl.scrollTop);
    }
  };

  const scheduleScrollTop = () => {
    if (scrollRaf) {
      return;
    }

    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      flushScrollTop();
    });
  };

  const syncScroll = () => {
    if (!wheelEl || !props.values.length) {
      return;
    }

    let idx = props.values.indexOf(props.value());
    if (idx < 0) {
      idx = 0;
    }

    const n = props.values.length;
    const mid = (REPEAT_BLOCKS / 2) | 0;
    const R = mid * n + idx;
    teleporting = true;
    wheelEl.scrollTop = R * ITEM_HEIGHT;
    setScrollTop(wheelEl.scrollTop);
    requestAnimationFrame(() => {
      teleporting = false;
    });
  };

  const maybeTeleport = () => {
    if (teleporting || !wheelEl) {
      return;
    }

    const block = blockHeight();
    const n = props.values.length;
    if (!n) {
      return;
    }

    const st = wheelEl.scrollTop;
    const low = TELEPORT_SHIFT * block;
    const high = (REPEAT_BLOCKS - TELEPORT_SHIFT) * block;

    if (st < low) {
      teleporting = true;
      wheelEl.scrollTop = st + TELEPORT_SHIFT * block;
      requestAnimationFrame(() => {
        teleporting = false;
        flushScrollTop();
      });
    } else if (st > high) {
      teleporting = true;
      wheelEl.scrollTop = st - TELEPORT_SHIFT * block;
      requestAnimationFrame(() => {
        teleporting = false;
        flushScrollTop();
      });
    }
  };

  const snapAndCommit = () => {
    if (!wheelEl || !props.values.length) {
      return;
    }

    const n = props.values.length;
    const rc = rowCount();
    const st = wheelEl.scrollTop;
    const ch = wheelEl.clientHeight;
    const center = st + ch / 2;
    let R = Math.round((center - PAD - ITEM_HEIGHT / 2) / ITEM_HEIGHT);
    if (R < 0) {
      R = 0;
    }
    if (R > rc - 1) {
      R = rc - 1;
    }

    const idx = R % n;
    const next = props.values[idx];
    const target = R * ITEM_HEIGHT;

    animateScrollTo(wheelEl, undefined, target, 120).then(() => {
      setScrollTop(wheelEl.scrollTop);
      if (next !== props.value()) {
        props.onChange(next);
      }
    });
  };

  const scheduleSettle = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (!dragging) {
        snapAndCommit();
      }
    }, 80);
  };

  onMount(() => {
    syncScroll();

    const onScroll = () => {
      if (!teleporting) {
        maybeTeleport();
      }

      scheduleScrollTop();
      scheduleSettle();
    };

    wheelEl.addEventListener('scroll', onScroll, { passive: true });

    const onTouchStart = () => {
      dragging = true;
      clearTimeout(settleTimer);
    };

    const onTouchEnd = () => {
      dragging = false;
      scheduleSettle();
    };

    wheelEl.addEventListener('touchstart', onTouchStart, { passive: true });
    wheelEl.addEventListener('touchend', onTouchEnd);
    wheelEl.addEventListener('touchcancel', onTouchEnd);

    const onScrollEnd = () => {
      dragging = false;
      flushScrollTop();
      snapAndCommit();
    };

    wheelEl.addEventListener('scrollend', onScrollEnd);

    onCleanup(() => {
      clearTimeout(settleTimer);
      cancelAnimationFrame(scrollRaf);
      scrollRaf = 0;
      wheelEl.removeEventListener('scroll', onScroll);
      wheelEl.removeEventListener('touchstart', onTouchStart);
      wheelEl.removeEventListener('touchend', onTouchEnd);
      wheelEl.removeEventListener('touchcancel', onTouchEnd);
      wheelEl.removeEventListener('scrollend', onScrollEnd);
    });
  });

  createEffect(() => {
    props.scrollToken?.();
    props.value();
    props.values.length;

    untrack(() => {
      queueMicrotask(syncScroll);
    });
  });

  return (
    <div class={combineClass('mobile-date-picker-column', props.class)}>
      <div ref={wheelEl as any} class="mobile-date-picker-wheel scrollbar-hidden">
        <div class="mobile-date-picker-wheel-inner" style={{ height: `${innerHeightPx()}px` }}>
          <For each={visibleRows()}>
            {(row) => (
              <div class="mobile-date-picker-item" style={{ top: `${PAD + row.r * ITEM_HEIGHT}px` }} data-value={row.v}>
                {props.format(row.v)}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

const pad2 = (n: number) => (n > 9 ? String(n) : '0' + n);

const defaultYearRange = (min: number, max: number) => {
  const a: number[] = [];

  for (let y = min; y <= max; y++) {
    a.push(y);
  }

  return a;
};

const monthValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/**
 * 移动端日期触控选择：年、月、日三栏循环滚动
 */
export const MobileDatePicker = (
  props?: JSX.HTMLAttributes<never> & {
    /**
     * 当前日期
     */
    value?: Date | string | number;
    /**
     * 值变化回调
     */
    onValueChange?: (value: Date) => void;
    /**
     * 最小年份
     */
    minYear?: number;
    /**
     * 最大年份
     */
    maxYear?: number;
  },
) => {
  const minY = () => props.minYear ?? 1970;
  const maxY = () => props.maxYear ?? 2100;

  const init = () => {
    let d = props.value != null ? parseDate(props.value) : null;
    d = d || new Date();
    let y = d.getFullYear();
    let m = d.getMonth() + 1;
    let day = d.getDate();
    y = Math.min(maxY(), Math.max(minY(), y));
    const dim = daysInMonth(y, m);
    day = Math.min(dim, Math.max(1, day));
    return { y, m, day };
  };

  const [year, setYear] = createSignal(init().y);
  const [month, setMonth] = createSignal(init().m);
  const [day, setDay] = createSignal(init().day);

  const years = createMemo(() => defaultYearRange(minY(), maxY()));

  const days = createMemo(() => {
    const dim = daysInMonth(year(), month());
    const a: number[] = [];

    for (let i = 1; i <= dim; i++) {
      a.push(i);
    }

    return a;
  });

  createEffect(() => {
    const v = props.value;

    if (v == null) {
      return;
    }

    let d = parseDate(v);
    if (!d) {
      return;
    }

    let y = d.getFullYear();
    let m = d.getMonth() + 1;
    let dd = d.getDate();
    y = Math.min(maxY(), Math.max(minY(), y));
    const dim = daysInMonth(y, m);
    dd = Math.min(dim, Math.max(1, dd));

    batch(() => {
      setYear(y);
      setMonth(m);
      setDay(dd);
    });
  });

  createEffect(() => {
    minY();
    maxY();
    const y = year();
    const c = Math.min(maxY(), Math.max(minY(), y));
    if (c !== y) {
      setYear(c);
    }
  });

  createEffect(() => {
    const dim = daysInMonth(year(), month());
    if (day() > dim) {
      setDay(dim);
    }
  });

  const emit = (y: number, m: number, d: number) => {
    const dim = daysInMonth(y, m);
    const dd = Math.min(dim, Math.max(1, d));
    props.onValueChange?.(new Date(y, m - 1, dd));
  };

  const onYear = (y: number) => {
    setYear(y);
    const dim = daysInMonth(y, month());
    const dd = Math.min(dim, day());
    if (dd !== day()) {
      setDay(dd);
    }

    emit(y, month(), dd);
  };

  const onMonth = (m: number) => {
    setMonth(m);
    const dim = daysInMonth(year(), m);
    const dd = Math.min(dim, day());
    if (dd !== day()) {
      setDay(dd);
    }

    emit(year(), m, dd);
  };

  const onDay = (d: number) => {
    setDay(d);
    emit(year(), month(), d);
  };

  return (
    <div
      class={combineClass('mobile-date-picker', props.class)}
      {...omitProps(props, ['class', 'value', 'onValueChange', 'minYear', 'maxYear'])}
    >
      <MobileDateLoopColumn values={years()} value={year} onChange={onYear} format={(y) => String(y)} />
      <MobileDateLoopColumn values={monthValues} value={month} onChange={onMonth} format={(m) => pad2(m)} />
      <MobileDateLoopColumn
        values={days()}
        value={day}
        onChange={onDay}
        format={(d) => pad2(d)}
        scrollToken={() => {
          year();
          month();
        }}
      />
    </div>
  );
};
