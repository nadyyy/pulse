import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/utils";
import { checkoutSchema, credentialsSchema } from "@/lib/validation";

describe("credentialsSchema", () => {
  it("normalizes email", () => {
    const result = credentialsSchema.safeParse({
      email: "USER@EXAMPLE.COM",
      password: "password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });
});

describe("checkoutSchema", () => {
  it("rejects invalid address", () => {
    const result = checkoutSchema.safeParse({
      email: "user@example.com",
      fullName: "",
      line1: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("slugify", () => {
  it("creates kebab-case slugs", () => {
    expect(slugify("Training & Gym")).toBe("training-and-gym");
  });
});
