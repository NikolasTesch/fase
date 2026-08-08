import { revalidatePath, revalidateTag } from "next/cache";

// Invalida o catálogo público (ISR) e o cache do chat Fabi após mutations
// admin — o profile do revalidateTag espelha o `revalidate: 300` do getCatalog
export function revalidateCatalog() {
  revalidatePath("/", "layout");
  revalidateTag("fabi-catalog", { revalidate: 300 });
}
