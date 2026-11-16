export const CATEGORIES = ["Destinations", "Beaches", "International", "Adventure", "Accommodations"];

export type PhotoRow = {
  id: number;
  image_url: string;
  caption: string;
  category: string;
};

export const PHOTO_COLUMNS = "id, image_url, caption, category";

// Converts a database row into the shape the admin screen uses.
export function toPhoto(r: PhotoRow) {
  return { id: r.id, url: r.image_url, caption: r.caption, category: r.category };
}