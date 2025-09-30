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
