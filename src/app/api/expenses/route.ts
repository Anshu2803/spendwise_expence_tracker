import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'date_desc';

    let query = supabase.from('expenses').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (sort === 'date_desc') {
      query = query.order('date', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idempotency_key, amount, category, description, date } = body;

    if (!idempotency_key) {
      return NextResponse.json({ detail: 'idempotency_key is required' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ detail: 'amount must be greater than 0' }, { status: 400 });
    }

    if (!category || category.trim() === '') {
      return NextResponse.json({ detail: 'category cannot be empty' }, { status: 400 });
    }

    const expenseData = {
      idempotency_key,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description || '',
      date
    };

    // Try to insert
    const { data, error } = await supabase.from('expenses').insert(expenseData).select();

    if (error) {
      // Check for unique constraint violation (idempotency key)
      if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique')) {
        // Fetch the existing record
        const { data: existingData, error: existingError } = await supabase
          .from('expenses')
          .select('*')
          .eq('idempotency_key', idempotency_key)
          .single();

        if (existingError) {
          return NextResponse.json({ detail: 'Conflict, but could not fetch existing record' }, { status: 409 });
        }

        return NextResponse.json(existingData, { status: 200 }); // Return 200 OK with existing data (Idempotency)
      }

      return NextResponse.json({ detail: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ detail: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
