import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { KITS } from '@/lib/constants';

export async function GET() {
  try {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Kits')
      .single();

    if (catError || !categories) {
      return NextResponse.json(KITS);
    }

    const { data: kits, error: kitsError } = await supabase
      .from('products')
      .select(`
        id, name, price, image_url, description,
        kit_items(quantity, products(name, price))
      `)
      .eq('category_id', categories.id);

    if (kitsError || !kits || kits.length === 0) {
      return NextResponse.json(KITS);
    }

    const formattedKits = kits.map((kit: any) => ({
      id: kit.id,
      name: kit.name,
      price: kit.price,
      imageUrl: kit.image_url,
      description: kit.description,
      items: kit.kit_items?.map((ki: any) => `${ki.products?.name || 'Produto'} (x${ki.quantity})`).join(', ') || '',
    }));

    return NextResponse.json(formattedKits);
  } catch (error: any) {
    console.error('Error fetching kits:', error);
    return NextResponse.json(KITS);
  }
}
