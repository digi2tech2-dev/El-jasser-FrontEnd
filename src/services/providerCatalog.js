// Collect every page advertised by the provider catalog API.
export async function fetchProviderCatalog(requestPage) {
  const products = [];
  const seen = new Set();
  let page = 1;

  while (true) {
    const { items, pagination } = await requestPage(page);
    if (!Array.isArray(items)) throw new Error('Invalid provider catalog response');

    let added = 0;
    for (const item of items) {
      const id = item?._id ?? item?.id;
      if (id != null && seen.has(String(id))) continue;
      if (id != null) seen.add(String(id));
      products.push(item);
      added += 1;
    }

    if (!pagination) return products;
    const totalPages = Number(pagination.pages ?? pagination.totalPages);
    const total = Number(pagination.total ?? pagination.totalItems ?? pagination.count);
    const limit = Number(pagination.limit);
    const pages = Number.isFinite(totalPages) && totalPages >= 0
      ? totalPages
      : (Number.isFinite(total) && Number.isFinite(limit) && limit > 0 ? Math.ceil(total / limit) : NaN);
    if (!Number.isFinite(pages)) throw new Error('Invalid provider catalog pagination');
    if (page >= pages) return products;
    if (!items.length || !added) throw new Error('Incomplete provider catalog pagination');
    page += 1;
  }
}
