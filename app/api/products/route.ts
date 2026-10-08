import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PRODUCTS } from '@/lib/constants';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        brand:brands(name)
      `);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(PRODUCTS);
    }

    if (!products || products.length === 0) {
      return NextResponse.json(PRODUCTS);
    }

    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.image_url,
      category: p.category?.name || 'Outros',
      brand: p.brand?.name || 'Outros',
      stars: p.stars || 5,
      description: p.description,
      coverage: p.coverage,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(PRODUCTS);
  }
}
