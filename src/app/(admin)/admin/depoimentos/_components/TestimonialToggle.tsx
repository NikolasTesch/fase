"use client";

import { useState } from "react";

export function TestimonialToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !active;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        console.error("[TestimonialToggle] erro", await res.json().catch(() => ({})));
        return;
      }
      setActive(next);
    } catch (err) {
      console.error("[TestimonialToggle] exceção", err);
    } finally {
      setSaving(false);
    }
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
