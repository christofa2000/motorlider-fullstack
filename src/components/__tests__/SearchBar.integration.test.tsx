import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import {
  usePathname,
  useRouter,
  useSearchParams
} from "next/navigation";

import SearchBar from "@/components/SearchBar";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn()
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedUsePathname = usePathname as jest.Mock;
const mockedUseSearchParams = useSearchParams as jest.Mock;

const createSearchParams = (value = ""): ReadonlyURLSearchParams => {
  const params = new URLSearchParams(value);
  return {
    get: (key: string) => params.get(key),
    toString: () => params.toString()
  } as unknown as ReadonlyURLSearchParams;
};

describe("SearchBar integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUsePathname.mockReturnValue("/productos");
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
    mockedUseSearchParams.mockReturnValue(createSearchParams());
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("debounces updates and pushes the trimmed query to the router", async () => {
    const onSearch = jest.fn();
    const push = jest.fn();
    mockedUseRouter.mockReturnValue({ push });

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole("searchbox", { name: /buscar repuesto/i });

    fireEvent.change(input, { target: { value: "  Pastillas  " } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("Pastillas");
    });

    expect(push).toHaveBeenCalledWith("/productos?q=Pastillas", {
      scroll: false
    });
  });

  it("submits immediately when the form is submitted", async () => {
    const onSearch = jest.fn();
    const push = jest.fn();
    mockedUseRouter.mockReturnValue({ push });

    render(<SearchBar onSearch={onSearch} initialValue="filtro" />);

    const form = screen.getByRole("search");
    const input = screen.getByRole("searchbox", { name: /buscar repuesto/i });

    fireEvent.change(input, { target: { value: "amortiguador" } });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("amortiguador");
    });

    expect(push).toHaveBeenCalledWith("/productos?q=amortiguador", {
      scroll: false
    });
  });
});
