export const animateScrollTo = (container: HTMLElement, x?: number, y?: number, duration?: number): Promise<void> => {
  if (x < 0) {
    x = 0;
  }

  if (y < 0) {
    y = 0;
  }

  return new Promise((resolve) => {
    const startTime = Date.now();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const distanceX = x != null ? x - scrollLeft : 0;
    const distanceY = y != null ? y - scrollTop : 0;

    duration = duration > 0 ? duration : 200;

    const step = () => {
      let elapsed = Date.now() - startTime;

      if (elapsed < duration) {
        let scale = elapsed / duration;

        container.scrollTo((scrollLeft + scale * distanceX) | 0, (scrollTop + scale * distanceY) | 0);
        requestAnimationFrame(step);
      } else {
        container.scrollTo(x, y);
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
};

export const animateScrollBy = (
  container: HTMLElement,
  offsetX?: number,
  offsetY?: number,
  duration?: number,
): Promise<void> => {
  return animateScrollTo(
    container,
    container.scrollLeft + (offsetX || 0),
    container.scrollTop + (offsetY || 0),
    duration,
  );
};

export const animateScrollIntoView = (
  container: HTMLElement,
  element: HTMLElement,
  duration?: number,
): Promise<void> => {
  let rect1 = container.getBoundingClientRect();
  let rect2 = element.getBoundingClientRect();

  return animateScrollTo(
    container,
    container.scrollLeft + rect2.left - rect1.left,
    container.scrollTop + rect2.top - rect1.top,
    duration,
  );
};
