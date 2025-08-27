import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { conversionId } = await req.json();
    
    if (!conversionId) {
      throw new Error('Conversion ID is required');
    }

    // Get conversion record
    const { data: conversion, error: conversionError } = await supabase
      .from('conversions')
      .select('*')
      .eq('id', conversionId)
      .single();

    if (conversionError || !conversion) {
      throw new Error('Conversion not found');
    }

    // Update status to processing
    await supabase
      .from('conversions')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', conversionId);

    // Simulate PDF processing with Python-like extraction
    // In real implementation, this would call a Python service
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

    // Mock extracted transaction data (in real app, this comes from Python PDF processing)
    const mockTransactions = [
      {
        date: '2024-01-15',
        description: 'Opening Balance',
        debit: '',
        credit: '',
        balance: '10,000.00'
      },
      {
        date: '2024-01-16',
        description: 'UPI/P2A/412345678/SALARY/COMPANY',
        debit: '',
        credit: '5,000.00',
        balance: '15,000.00'
      },
      {
        date: '2024-01-17',
        description: 'ATM CASH WITHDRAWAL',
        debit: '2,000.00',
        credit: '',
        balance: '13,000.00'
      },
      {
        date: '2024-01-18',
        description: 'UPI/P2M/AMAZON/ONLINE PURCHASE',
        debit: '500.00',
        credit: '',
        balance: '12,500.00'
      },
      {
        date: '2024-01-19',
        description: 'INTEREST CREDIT',
        debit: '',
        credit: '100.00',
        balance: '12,600.00'
      }
    ];

    // Create Excel-like CSV content
    const headers = ['Date', 'Description', 'Debit', 'Credit', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...mockTransactions.map(t => [
        t.date,
        `"${t.description}"`, // Quote descriptions to handle commas
        t.debit,
        t.credit,
        t.balance
      ].join(','))
    ].join('\n');

    // Convert to base64 for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(csvContent);
    const base64Data = btoa(String.fromCharCode(...data));

    // Update conversion with results
    const { error: updateError } = await supabase
      .from('conversions')
      .update({
        status: 'completed',
        processing_completed_at: new Date().toISOString(),
        transactions_count: mockTransactions.length,
        result_url: `data:text/csv;base64,${base64Data}`
      })
      .eq('id', conversionId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        conversionId,
        transactions: mockTransactions,
        downloadUrl: `data:text/csv;base64,${base64Data}`,
        fileName: conversion.file_name.replace('.pdf', '_converted.csv')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});