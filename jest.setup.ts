if (typeof globalThis.setImmediate === "undefined") {
  (
    globalThis as unknown as { setImmediate: typeof setImmediate }
  ).setImmediate = ((fn: (...args: unknown[]) => void, ...args: unknown[]) =>
    setTimeout(fn, 0, ...args)) as unknown as typeof setImmediate;
}

import "@testing-library/jest-dom";
import React from "react";

// Mock de next/image compatible con React 19 @ tests
jest.mock("next/image", () => {
  return {
    __esModule: true,
    default: ({
      unoptimized,
      priority,
      fill,
      loader,
      quality,
      sizes,
      placeholder,
      blurDataURL,
      onLoadingComplete,
      ...rest
    }: any) => {
      // Eliminamos props que <img> no entiende y que generan warnings
      // Mantener alt, src, width, height, className, style, etc.
      // eslint-disable-next-line @next/next/no-img-element
      return React.createElement("img", rest);
    },
  };
});
