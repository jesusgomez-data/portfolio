// jg_core_v3.js - Conexión Real con Supabase
const supabaseUrl = 'https://qxgfijtibracrrlhceeo.supabase.co';
const supabaseKey = 'sb_publishable_SAujRd5vtbNvHU4pxJj5Kw_iEvTbs8w';

let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error("Supabase init error:", e);
}

// ---------------------------
// AUTENTICACIÓN (Real con Supabase)
// ---------------------------
async function login(email, password) {
    // 1. Autenticar con Supabase de forma segura
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });
    
    if (authError || !authData.user) {
        let msg = authError ? authError.message : 'Desconocido';
        if (msg.includes('Invalid login credentials')) {
            msg = 'Correo o contraseña incorrectos. Verifica tus datos.';
        } else if (msg.includes('Failed to fetch')) {
            msg = 'No se pudo conectar con el servidor de Supabase. Revisa tu conexión a internet o intenta nuevamente.';
        }
        throw new Error(msg);
    }
    
    const user = authData.user;
    
    // 2. Determinar si es CEO (Administrador)
    if (email === 'jesusgomez.s@hotmail.com' || email.includes('ceo')) {
        localStorage.setItem('jg_user_role', 'admin');
        localStorage.setItem('jg_user_email', email);
        return { user: { email: email, role: 'admin' } };
    }
    
    // 3. Si es cliente, verificar que tiene un proyecto asociado
    const { data: projectData, error: projectError } = await supabaseClient
        .from('proyectos')
        .select('id')
        .eq('cliente_email', email)
        .single();
        
    if (projectError || !projectData) {
        // Hacemos log out inmediatamente si no tiene proyecto asignado
        await supabaseClient.auth.signOut();
        throw new Error('Cuenta válida, pero aún no tienes un proyecto asignado en el sistema.');
    }
    
    localStorage.setItem('jg_user_role', 'client');
    localStorage.setItem('jg_user_email', email);
    localStorage.setItem('jg_client_project_id', projectData.id);
    return { user: { email: email, role: 'client' } };
}

async function logout() {
    localStorage.removeItem('jg_user_role');
    localStorage.removeItem('jg_user_email');
    localStorage.removeItem('jg_client_project_id');
    localStorage.removeItem('demo_email');
    await supabaseClient.auth.signOut();
}

// ---------------------------
// FUNCIONES DEL CEO (admin.html)
// ---------------------------
async function loadAllProjects() {
    const { data, error } = await supabaseClient
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) console.error(error);
    return data || [];
}

async function createNewProject(nombre, email, monto) {
    const { data, error } = await supabaseClient
        .from('proyectos')
        .insert([
            { nombre_proyecto: nombre, cliente_email: email, monto_mantenimiento: monto }
        ])
        .select();
    if (error) {
        console.error(error);
        throw error;
    }
    return data;
}

async function updateProject(id, updates) {
    const { data, error } = await supabaseClient
        .from('proyectos')
        .update(updates)
        .eq('id', id);
    if (error) {
        console.error(error);
        throw error;
    }
    return data;
}

// ---------------------------
// FUNCIONES DEL CLIENTE (portal.html)
// ---------------------------
async function getClientProject(email) {
    const { data, error } = await supabaseClient
        .from('proyectos')
        .select('*')
        .eq('cliente_email', email)
        .single();
    if (error) console.error(error);
    return data;
}

// ---------------------------
// SISTEMA DE CHAT
// ---------------------------
async function getMessages(projectId) {
    const { data, error } = await supabaseClient
        .from('mensajes')
        .select('*')
        .eq('proyecto_id', projectId)
        .order('created_at', { ascending: true });
    if (error) console.error(error);
    return data || [];
}

async function sendMessage(projectId, sender, text) {
    const { data, error } = await supabaseClient
        .from('mensajes')
        .insert([
            { proyecto_id: projectId, sender: sender, mensaje: text }
        ]);
    if (error) throw error;
    return data;
}
