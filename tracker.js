/**
 * JGStudio Unified Tracking Engine (v1.0)
 * Sistema centralizado de medición de Tráfico Web y Leads para proyectos clientes.
 */
(function(window, document) {
  'use strict';

  const SUPABASE_URL = 'https://qxgfijtibracrrlhceeo.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_SAujRd5vtbNvHU4pxJj5Kw_iEvTbs8w';

  // Detectar configuración desde el tag script
  const currentScript = document.currentScript;
  const projectEmail = currentScript ? currentScript.getAttribute('data-project-email') : null;

  async function updateMetric(email, metricType) {
    if (!email) {
      console.warn('[JGStudio Tracker] Error: No se especificó el email del proyecto (data-project-email).');
      return;
    }

    try {
      // Cargar Supabase JS si no está presente en la página
      if (!window.supabase) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // 1. Obtener métricas actuales del proyecto
      const { data, error } = await client
        .from('proyectos')
        .select('id, visitas, leads')
        .eq('cliente_email', email)
        .single();

      if (error || !data) {
        console.warn('[JGStudio Tracker] No se encontró el proyecto con email:', email);
        return;
      }

      // 2. Incrementar la métrica correspondiente
      const updates = {};
      if (metricType === 'visit') {
        const currentVisits = parseInt(data.visitas, 10) || 0;
        updates.visitas = String(currentVisits + 1);
      } else if (metricType === 'lead') {
        const currentLeads = parseInt(data.leads, 10) || 0;
        updates.leads = String(currentLeads + 1);
      }

      await client
        .from('proyectos')
        .update(updates)
        .eq('cliente_email', email);

      console.log(`[JGStudio Tracker] +1 ${metricType} registrado exitosamente para ${email}.`);
    } catch (err) {
      console.error('[JGStudio Tracker] Error actualizando métricas:', err);
    }
  }

  // 1. Conteo automático de visitas (1 por sesión)
  if (projectEmail) {
    const sessionKey = 'jgs_tracked_' + btoa(projectEmail).replace(/=/g, '');
    if (!sessionStorage.getItem(sessionKey)) {
      updateMetric(projectEmail, 'visit').then(() => {
        sessionStorage.setItem(sessionKey, 'true');
      });
    }
  }

  // 2. API Global accesible para registrar Leads desde la app o formularios
  window.JGStudio = {
    trackVisit: function(emailOverride) {
      return updateMetric(emailOverride || projectEmail, 'visit');
    },
    trackLead: function(emailOverride) {
      return updateMetric(emailOverride || projectEmail, 'lead');
    }
  };

})(window, document);
