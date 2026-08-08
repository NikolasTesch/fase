import { revalidatePath, revalidateTag } from "next/cache";

// Revalida o catálogo público (ISR) e o cache do chat Fabi após mutations admin.
// No Next 16 o revalidateTag exige um profile — expire espelha o revalidate:300 do getCatalog.
export function revalidateCatalog() {
  revalidatePath("/", "layout");
  revalidateTag("fabi-catalog", { expire: 300 });
}
