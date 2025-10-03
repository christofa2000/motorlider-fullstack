if (typeof globalThis.setImmediate === "undefined") {
  (globalThis as unknown as { setImmediate: typeof setImmediate }).setImmediate = (
    (fn: (...args: unknown[]) => void, ...args: unknown[]) => setTimeout(fn, 0, ...args)
  ) as unknown as typeof setImmediate;
}

import "@testing-library/jest-dom";
import React from "react";

type NextImageProps = {
  src: string;
  alt: string;
  [key: string]: unknown;
};

jest.mock("next/image", () => {
  return {
    __esModule: true,
    default: ({ alt, src, ...props }: NextImageProps) =>
      React.createElement("img", {
        alt,
        src,
        ...props
      })
  };
});

