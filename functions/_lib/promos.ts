export type PromoRow = {
  id: number;
  title: string;
  destination: string | null;
  discount: string | null;
  image_url: string | null;
  end_date: string | null;
  is_active: number;
};

export const PROMO_COLUMNS = "id, title, destination, discount, image_url, end_date, is_active";

// Converts a database row into the shape the admin screen already uses.
export function toPromo(r: PromoRow) {
  return {
    id: r.id,
    title: r.title,
    destination: r.destination ?? "",
    discount: r.discount ?? "",
    validUntil: r.end_date ?? "",
    active: r.is_active === 1,
    photo: r.image_url ?? undefined,
  };
}