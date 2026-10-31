// tareas.js — Lista de tareas del proyecto (cliente crea, profesional hace check-in)
// Requiere: supabaseClient (jg_core_v3.js) y la tabla "tareas" (supabase/tareas.sql)

const TareasUI = (() => {
    const channels = {};
    const LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', hecha: 'Hecha' };

    function esc(text) {
        const d = document.createElement('div');
        d.textContent = text || '';
        return d.innerHTML;
    }

    function fmt(iso) {
        return iso ? new Date(iso).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    }

    async function fetchTasks(projectId) {
        const { data, error } = await supabaseClient
            .from('tareas')
            .select('*')
            .eq('proyecto_id', projectId)
            .order('created_at', { ascending: true });
        if (error) { console.error('Error al cargar tareas:', error); return null; }
        return data || [];
    }

    async function addTask(projectId, titulo, creadoPor) {
        const clean = (titulo || '').trim();
        if (!clean) return null;
        const { data, error } = await supabaseClient
            .from('tareas')
            .insert([{ proyecto_id: projectId, titulo: clean, estado: 'pendiente', creado_por: creadoPor }])
            .select();
        if (error) throw error;
        return data && data[0];
    }

    async function setStatus(taskId, estado) {
        const { error } = await supabaseClient
            .from('tareas')
            .update({ estado: estado, checkin_at: estado === 'hecha' ? new Date().toISOString() : null })
            .eq('id', taskId);
        if (error) throw error;
    }

    function subscribe(projectId, onChange) {
        if (!supabaseClient) return;
        if (channels[projectId]) {
            try { supabaseClient.removeChannel(channels[projectId]); } catch (e) {}
        }
        const ch = supabaseClient.channel('tareas_' + projectId)
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'tareas', filter: `proyecto_id=eq.${projectId}`
            }, () => onChange());
        ch.subscribe();
        channels[projectId] = ch;
    }

    function paint(el, tasks) {
        const role = el.dataset.tkRole;
        const done = tasks.filter(t => t.estado === 'hecha').length;
        const open = tasks.length - done;
        const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

        el.querySelector('[data-tk-summary]').textContent =
            tasks.length ? `${done} de ${tasks.length} hechas` : 'Aún no hay tareas';
        el.querySelector('[data-tk-meter]').style.width = pct + '%';
        el.querySelector('[data-tk-empty]').hidden = tasks.length > 0;

        const scope = el.closest('.tk-scope');
        const badge = scope && scope.querySelector('[data-tk-count]');
        if (badge) {
            badge.textContent = open > 0 ? open : '';
            badge.hidden = open === 0;
        }

        // Abiertas primero, hechas al final
        const ordered = [...tasks].sort((a, b) => (a.estado === 'hecha') - (b.estado === 'hecha'));

        el.querySelector('[data-tk-list]').innerHTML = ordered.map(t => {
            const actions = role !== 'admin' ? '' : `
                <div class="tk-actions">
                    ${t.estado === 'pendiente' ? `<button type="button" data-act="en_proceso" data-id="${t.id}">En proceso</button>` : ''}
                    ${t.estado !== 'hecha'
                        ? `<button type="button" class="tk-primary" data-act="hecha" data-id="${t.id}"><i class="fas fa-check"></i> Check-in</button>`
                        : `<button type="button" data-act="pendiente" data-id="${t.id}">Reabrir</button>`}
                </div>`;
            const checkin = t.checkin_at ? ` · Check-in ${fmt(t.checkin_at)}` : '';
            const origin = t.creado_por === 'client' ? 'Pedida por el cliente' : 'Asignada por JGStudio';
            return `
                <li class="tk-item ${t.estado}">
                    <span class="tk-check">${t.estado === 'hecha' ? '<i class="fas fa-check"></i>' : ''}</span>
                    <div class="tk-body">
                        <span class="tk-title">${esc(t.titulo)}</span>
                        <span class="tk-meta">${origin} · ${fmt(t.created_at)}${checkin}</span>
                    </div>
                    <span class="tk-state tk-state-${t.estado}">${LABEL[t.estado] || t.estado}</span>
                    ${actions}
                </li>`;
        }).join('');
    }

    function skeleton(role) {
        const form = role === 'client' ? `
            <form class="tk-form" data-tk-form>
                <input type="text" class="tk-input" maxlength="200" placeholder="Pide una tarea, p. ej.: Cambiar el logo del header" autocomplete="off">
                <button type="submit" class="tk-add"><i class="fas fa-plus"></i> Agregar</button>
            </form>` : '';
        return `
            <div class="tk-summary-row">
                <span class="tk-summary" data-tk-summary>Cargando tareas...</span>
                <div class="tk-meter-track"><div class="tk-meter" data-tk-meter></div></div>
            </div>
            ${form}
            <ul class="tk-list" data-tk-list></ul>
            <p class="tk-empty" data-tk-empty hidden>
                ${role === 'client'
                    ? 'Aquí puedes pedir tareas para el equipo. Cada una quedará registrada hasta su check-in.'
                    : 'El cliente aún no ha pedido tareas en este proyecto.'}
            </p>`;
    }

    async function mount(el, projectId, role) {
        if (!el || !projectId) return;
        el.dataset.tkRole = role;
        el.dataset.tkProject = projectId;
        el.dataset.tkMounted = '1';
        el.classList.add('tk-panel');
        el.innerHTML = skeleton(role);

        const refresh = async () => {
            const tasks = await fetchTasks(projectId);
            if (tasks) paint(el, tasks);
        };

        if (role === 'client') {
            const form = el.querySelector('[data-tk-form]');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = form.querySelector('.tk-input');
                const text = input.value;
                if (!text.trim()) return;
                input.value = '';
                try {
                    await addTask(projectId, text, 'client');
                    await refresh();
                } catch (err) {
                    console.error('Error al crear tarea:', err);
                    input.value = text;
                    alert('No se pudo enviar la tarea. Comprueba tu conexión.');
                }
            });
        } else {
            el.addEventListener('click', async (e) => {
                const btn = e.target.closest('[data-act]');
                if (!btn) return;
                btn.disabled = true;
                try {
                    await setStatus(btn.dataset.id, btn.dataset.act);
                    await refresh();
                } catch (err) {
                    console.error('Error al actualizar tarea:', err);
                    btn.disabled = false;
                    alert('No se pudo actualizar la tarea.');
                }
            });
        }

        await refresh();
        subscribe(projectId, refresh);
    }

    // Pestañas dentro de un .tk-scope. Carga perezosa del panel de tareas (admin).
    function tab(btn) {
        const scope = btn.closest('.tk-scope');
        if (!scope) return;
        const name = btn.dataset.tab;
        scope.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b === btn));
        scope.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== name; });

        const pane = scope.querySelector(`[data-pane="${name}"]`);
        if (pane && pane.dataset.tkLazy && !pane.dataset.tkMounted) {
            mount(pane, pane.dataset.tkProject, pane.dataset.tkLazy);
        }
    }

    return { mount, tab };
})();

// Para usar desde atributos onclick en el HTML
function tkTab(btn) { TareasUI.tab(btn); }
