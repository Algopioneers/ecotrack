export async function getCmsPage(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/cms/slug/${slug}`, {
      next: { revalidate: 60 } // Automatically revalidate the cache every 60 seconds
    });
    
    if (!res.ok) {
        return null;
    }
    
    const data = await res.json();
    return data.page; // returns { title, content, metaTitle, metaDescription, featuredImage... }
  } catch (error) {
    console.error(`Error fetching CMS page for slug [${slug}]:`, error);
    return null;
  }
}
