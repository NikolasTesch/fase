"use client";

import { useState } from "react";

export function TestimonialToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !active;
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    setActive(next);
    setSaving(false);
  }

  return (
    <input
      type="checkbox"
      checked={active}
      onChange={toggle}
      disabled={saving}
      className="rounded"
    />
  );
}
