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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from request (optional for anonymous usage)
    let user = null;
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data } = await supabase.auth.getUser(token);
        user = data.user;
      }
    } catch (error) {
      console.log('No auth token provided, proceeding as anonymous');
    }

    // Parse the form data
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    
    if (!pdfFile) {
      throw new Error('No PDF file provided');
    }

    // Validate file
    if (pdfFile.type !== 'application/pdf') {
      throw new Error('File must be a PDF');
    }

    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB');
    }

    // Check usage limits
    const today = new Date().toISOString().split('T')[0];
    let maxConversions = 1; // Anonymous default
    
    if (user) {
      // Check if user has upgraded limits (registered users get 5)
      maxConversions = 5;
    }

    // Check current usage
    const { data: usageData } = await supabase
      .from('usage_limits')
      .select('conversions_used')
      .eq('user_id', user?.id || null)
      .eq('date', today)
      .maybeSingle();

    const currentUsage = usageData?.conversions_used || 0;
    
    if (currentUsage >= maxConversions) {
      throw new Error(`Daily limit reached. You can convert ${maxConversions} file(s) per day.`);
    }

    // Create conversion record
    const { data: conversion, error: conversionError } = await supabase
      .from('conversions')
      .insert({
        user_id: user?.id || null,
        file_name: pdfFile.name,
        file_size: pdfFile.size,
        status: 'pending'
      })
      .select()
      .single();

    if (conversionError) throw conversionError;

    // Upload file to storage
    const filePath = `${conversion.id}/${pdfFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bank-statements-uploaded')
      .upload(filePath, pdfFile, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Update conversion record with file path and status
    const { error: updateError } = await supabase
      .from('conversions')
      .update({
        upload_url: uploadData.path,
        status: 'uploaded'
      })
      .eq('id', conversion.id);

    if (updateError) throw updateError;

    // Update usage
    const { error: usageError } = await supabase
      .from('usage_limits')
      .upsert({
        user_id: user?.id || null,
        date: today,
        conversions_used: currentUsage + 1,
        max_daily_conversions: maxConversions
      });

    if (usageError) throw usageError;

    // Return conversion ID for tracking
    return new Response(
      JSON.stringify({
        success: true,
        conversionId: conversion.id,
        uploadPath: uploadData.path,
        message: 'PDF uploaded successfully. Processing will begin shortly.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Upload error:', error);
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