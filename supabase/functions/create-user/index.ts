import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'
import { corsHeaders } from 'https://esm.sh/@supabase/supabase-js@2.95.0/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the caller is an admin
    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: isAdmin } = await adminClient.rpc('has_role', { _user_id: caller.id, _role: 'admin' })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Only admins can create users' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { email, password, role, fullName, additionalData } = await req.json()

    if (!email || !password || !role || !fullName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!['teacher', 'student'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Assign role
    await adminClient.from('user_roles').insert({ user_id: newUser.user.id, role })

    // Create profile
    if (role === 'teacher') {
      await adminClient.from('teachers').insert({
        user_id: newUser.user.id,
        full_name: fullName,
        employee_id: additionalData?.employeeId || `T${Date.now()}`,
        department: additionalData?.department || null,
        phone: additionalData?.phone || null,
        specialization: additionalData?.specialization || null,
      })
    } else if (role === 'student') {
      await adminClient.from('students').insert({
        user_id: newUser.user.id,
        full_name: fullName,
        roll_number: additionalData?.rollNumber || `S${Date.now()}`,
        class_id: additionalData?.classId || null,
        parent_name: additionalData?.parentName || null,
        parent_email: additionalData?.parentEmail || null,
        parent_phone: additionalData?.parentPhone || null,
        date_of_birth: additionalData?.dateOfBirth || null,
        address: additionalData?.address || null,
      })
    }

    return new Response(JSON.stringify({ user: newUser.user, role }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
