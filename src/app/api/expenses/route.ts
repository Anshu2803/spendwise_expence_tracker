import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://kdxkvpydmcozdexwdgdr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeGt2cHlkbWNvemRleHdkZ2RyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc5ODcwNCwiZXhwIjoyMDkyMzc0NzA0fQ.ip5amJqJ5m0rilz2uPngEedNrBFrnhZ7dsUd8rBx-Fs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getUserFromHeader(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  return token;
}

export async function GET(request: Request) {
  try {
    const userToken = getUserFromHeader(request);
    if (!userToken) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) {
      return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'date_desc';

    let query = supabase.from('expenses').select('*').eq('user_id', user.id);

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
    const userToken = getUserFromHeader(request);
    if (!userToken) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) {
      return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

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
      user_id: user.id,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description || '',
      date
    };

    const { data, error } = await supabase.from('expenses').insert(expenseData).select();

    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('unique')) {
        const { data: existingData, error: existingError } = await supabase
          .from('expenses')
          .select('*')
          .eq('idempotency_key', idempotency_key)
          .eq('user_id', user.id)
          .single();

        if (existingError) {
          return NextResponse.json({ detail: 'Conflict, but could not fetch existing record' }, { status: 409 });
        }

        return NextResponse.json(existingData, { status: 200 });
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
    const userToken = getUserFromHeader(request);
    if (!userToken) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken);
    if (authError || !user) {
      return NextResponse.json({ detail: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ detail: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
