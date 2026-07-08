import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BottomNav } from "../BottomNav";

describe("BottomNav", () => {
  it("renders navigation items and marks the active page", async () => {
    const user = userEvent.setup();
    const setPage = vi.fn();

    render(<BottomNav page="home" setPage={setPage} />);

    expect(screen.getByRole("button", { name: /home/i })).toHaveClass("active");
    await user.click(screen.getByRole("button", { name: /train/i }));

    expect(setPage).toHaveBeenCalledWith("train");
  });
});
