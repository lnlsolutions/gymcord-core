import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../AuthProvider";
import { useAuth } from "../AuthContext";
import { createMockAuthService } from "../../test/utils";

function AuthProbe() {
  const auth = useAuth();
  return <button onClick={() => auth.signIn({ email: "member@gymcord.test", password: "secret" })}>{auth.status}:{auth.isAuthenticated ? "yes" : "no"}</button>;
}

describe("AuthProvider", () => {
  it("restores auth state and exposes sign-in actions", async () => {
    const service = createMockAuthService(null);
    render(<AuthProvider service={service}><AuthProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("unauthenticated:no"));
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("authenticated:yes"));
  });
});
