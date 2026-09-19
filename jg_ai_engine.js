/**
 * JGStudio AI Engine — Motor Inteligente con RAG, Memoria Contextual y Captura de Leads
 * Diseñado para JGStudio (Jesús Gómez)
 */

(function(window) {
    'use strict';

    const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzX01G9pz9yjuG7Vw1d-nzMTHFKdO-vZmLiW37I1jg1RaZzTCsNmqJmgmtLXARujCry/exec';
    const WHATSAPP_URL = 'https://wa.me/34684005740?text=Hola%20Jes%C3%BAs,%20estuve%20revisando%20el%20sitio%20de%20JGStudio%20y%20me%20gustar%C3%ADa%20conversar%20sobre%20un%20proyecto.';

    // ─────────────────────────────────────────────────────────────
    // 1. BASE DE CONOCIMIENTO ESTRUCTURADA
    // ─────────────────────────────────────────────────────────────
    const KNOWLEDGE_BASE = [
        {
            id: 'pricing_models',
            category: 'pricing',
            title: 'Precios y Tarifas de JGStudio',
            keywords: [
                'precio', 'precios', 'cuanto cuesta', 'cuánto cuesta', 'cuanto vale', 'cuánto vale',
                'tarifa', 'tarifas', 'presupuesto', 'costo', 'coste', 'costos', 'costes',
                'planes', 'suscripcion', 'suscripción', 'pago', 'pagar', 'cobras', 'cobran'
            ],
            content: `En **JGStudio** trabajamos con tarifas claras y sin costes ocultos:

• **Landing Page de Alta Conversión:** Desde 350€ / $380 USD *(Entrega en 1-2 semanas)*.
• **Web Corporativa & Autoridad:** Desde 750€ / $800 USD *(Diseño exclusivo + SEO + Panel)*.
• **Automatizaciones & Chatbots IA:** Desde 750€ / $800 USD *(Flujos n8n/Make + Integración CRM)*.
• **App Web / Plataforma SaaS a Medida:** Desde 1.500€ / $1.600 USD *(Next.js + Supabase + Pasarela)*.
• **Partner Tecnológico (Suscripción Mensual):** Desarrollo, diseño y soporte continuo sin nómina fija.

Puedes calcular una propuesta exacta en nuestro configurador online o escribirnos directamente.`,
            suggestions: [
                { text: 'Calcular Presupuesto Online', url: 'presupuesto.html' },
                { text: 'Tiempos de Entrega', query: 'cuanto tardan en entregar' },
                { text: 'Consultar por WhatsApp', url: WHATSAPP_URL, external: true }
            ]
        },
        {
            id: 'delivery_timelines',
            category: 'timeline',
            keywords: [
                'tiempo', 'tiempos', 'plazo', 'plazos', 'cuanto tardan', 'cuánto tardan',
                'cuanto tarda', 'cuánto tarda', 'tarda', 'tardan', 'tardas', 'demora',
                'entrega', 'entregas', 'dias', 'días', 'semanas', 'urgente', 'rapido', 'rápido'
            ],
            title: 'Tiempos de Entrega',
            content: `Nuestros plazos de entrega están **garantizados por contrato**:

• **Landing Pages:** 1 a 2 semanas.
• **Webs Corporativas:** 2 a 3 semanas.
• **Automatizaciones y Flujos con IA:** 1 a 3 semanas.
• **Plataformas SaaS y Apps Complejas:** 4 a 8 semanas.

Si tienes una fecha límite o urgencia, disponemos de servicio prioritario para acelerar el lanzamiento.`,
            suggestions: [
                { text: 'Configurar Presupuesto', url: 'presupuesto.html' },
                { text: 'Ver Tarifas', query: 'cuales son los precios' },
                { text: 'Hablar de plazos urgentes', url: WHATSAPP_URL, external: true }
            ]
        },
        {
            id: 'case_study_rival_fit',
            category: 'case_study',
            keywords: [
                'rival fit', 'rival', 'fitness', 'crossfit', 'gimnasio', 'gym',
                'box', 'entrenamiento', 'workout', 'deporte', 'app fitness', 'caso fitness', 'caso gym'
            ],
            title: 'Caso de Éxito: Rival Fit',
            content: `**Rival Fit** es uno de nuestros proyectos insignia en el sector Fitness y SaaS:

• **Objetivo:** Crear una plataforma digital completa para boxes de CrossFit y gimnasios.
• **Lo que desarrollamos:**
  1. **Branding e Identidad Visual:** Posicionamiento atlético y moderno de la marca *Rival Fit*.
  2. **App Web & Móvil:** Registro de WODs, marcas personales (PRs), reservas y tabla de líderes en tiempo real.
  3. **Panel de Gestión:** Automatización de cuotas y analítica de retención para los administradores.
• **Stack Tecnológico:** Next.js, Supabase, Tailwind CSS y arquitectura serverless.`,
            suggestions: [
                { text: 'Ver Proyectos en Portfolio', url: 'proyectos.html' },
                { text: '¿Cuánto cuesta una app similar?', query: 'cuanto cuesta una app como rival fit' },
                { text: 'Presupuesto para App', url: 'presupuesto.html?tipo=app' }
            ]
        },
        {
            id: 'case_study_stencil2',
            category: 'case_study',
            keywords: [
                'stencil', 'stencil2', 'tatuaje', 'tatuajes', 'tattoo',
                'artistas', 'ilustracion', 'vectorizar', 'estudio tatuaje'
            ],
            title: 'Caso de Éxito: Stencil2',
            content: `**Stencil2** es una solución de software que desarrollamos para estudios de tatuaje y artistas creativos:

• **El Reto:** Automatizar y acelerar la creación de calcos y plantillas de tatuaje eliminando el trabajo manual de vectorización.
• **La Solución:** Web app de alta precisión con procesamiento de imagen en tiempo real, calibración milimétrica por capas y exportación lista para imprimir.
• **Resultado:** Reducción del 70% en el tiempo de preparación previa de cada sesión.`,
            suggestions: [
                { text: 'Ver en Proyectos', url: 'proyectos.html' },
                { text: 'Desarrollo de Software a Medida', url: 'presupuesto.html?tipo=app' }
            ]
        },
        {
            id: 'services_ai_automation',
            category: 'service_ia',
            keywords: [
                'ia', 'inteligencia artificial', 'automatizacion', 'automatización', 'automatizar',
                'bot', 'chatbot', 'chatbots', 'n8n', 'make', 'scraping', 'crm', 'leads',
                'flujos', 'agente', 'agentes', 'ventas automaticas', 'whatsapp bot', 'repetitivas'
            ],
            title: 'Automatizaciones e Inteligencia Artificial',
            content: `Diseñamos e integramos **sistemas de Inteligencia Artificial y Automatización** para que tu negocio funcione en piloto automático:

• **Chatbots y Agentes de Venta 24/7:** Calificación instantánea de clientes potenciales en WhatsApp, Instagram y Web.
• **Conexión de Flujos (n8n & Make):** Sincronización automática entre tu formulario, CRM, Notion, Google Sheets y facturación.
• **Web Scraping & Inteligencia:** Extracción automática de datos de competidores, precios y leads del mercado.
• **Ahorro de Tiempo:** Eliminamos más de 15 horas semanales de trabajo operativo repetitivo.`,
            suggestions: [
                { text: 'Ver Casos de IA', url: 'proyectos.html#ia' },
                { text: 'Tarifas de Automatización', query: 'precios de automatizacion con ia' },
                { text: 'Hablar con Jesús por WhatsApp', url: WHATSAPP_URL, external: true }
            ]
        },
        {
            id: 'services_web_apps',
            category: 'service_web',
            keywords: [
                'web', 'webs', 'pagina', 'página', 'paginas', 'p連結ginas', 'landing', 'landing page',
                'landings', 'app', 'apps', 'aplicacion', 'aplicación', 'saas', 'software',
                'nextjs', 'react', 'supabase', 'ecommerce', 'tienda', 'tienda online'
            ],
            title: 'Desarrollo Web & Apps a Medida',
            content: `Creamos **sitios web y aplicaciones de alto rendimiento** orientadas a captar clientes:

• **Landing Pages de Alta Conversión:** Diseñadas para maximizar el retorno de tus campañas de publicidad.
• **Webs Corporativas Premium:** Diseño a medida, optimización SEO y máxima velocidad de carga.
• **Plataformas SaaS & Portales Privados:** Paneles de usuario, sistemas de reservas, gestión de clientes y pasarelas de pago.
• **E-commerce:** Tiendas online rápidas, sin comisiones de plataforma y con checkout optimizado.`,
            suggestions: [
                { text: 'Ver Portfolio Web', url: 'proyectos.html' },
                { text: '¿Cuánto tardan?', query: 'tiempos de entrega web' },
                { text: 'Pedir Presupuesto', url: 'presupuesto.html?tipo=web' }
            ]
        },
        {
            id: 'services_overview',
            category: 'services',
            keywords: [
                'servicio', 'servicios', 'ofrece', 'ofrecen', 'hacen', 'hace', 'soluciones',
                'que haces', 'que hacen', 'desarrollo', 'trabajos', 'especialidad', 'portfolio'
            ],
            title: 'Servicios de JGStudio',
            content: `En **JGStudio** ayudamos a empresas y creadores a escalar digitalmente mediante 3 áreas principales:

1. **Desarrollo Web & Software:** Landings de alta conversión, webs corporativas y aplicaciones SaaS a medida.
2. **Automatización con IA:** Agentes de venta 24/7, flujos n8n/Make y sincronización de bases de datos.
3. **Branding & Contenido Visual:** Identidad de marca sólida y edición de vídeo comercial para redes y anuncios.

¿Sobre cuál de estas áreas te gustaría recibir más información?`,
            suggestions: [
                { text: 'Desarrollo Web & Apps', query: 'desarrollo web' },
                { text: 'Automatizaciones IA', query: 'automatizacion ia' },
                { text: 'Tarifas y Precios', query: 'cuales son sus precios' },
                { text: 'Solicitar Presupuesto', url: 'presupuesto.html' }
            ]
        },
        {
            id: 'founder_jesus_gomez',
            category: 'founder',
            keywords: [
                'jesus', 'jesús', 'gomez', 'gómez', 'jesus gomez', 'jesús gómez',
                'quien es', 'quién es', 'quien eres', 'quién eres', 'fundador', 'ceo', 'experiencia', 'estudio', 'jgstudio'
            ],
            title: 'Sobre Jesús Gómez y JGStudio',
            content: `**Jesús Gómez** es el fundador y líder técnico de **JGStudio**:

• **Especialidad:** Desarrollador Full-Stack, consultor de automatización con IA y diseñador digital.
• **Diferencial JGStudio:** Trato 1 a 1 directo con el especialista que crea tu producto, sin burocracia ni costes inflados de agencias tradicionales.
• **Garantía:** Comunicación transparente, código propio y soporte continuo post-entrega.`,
            suggestions: [
                { text: 'Ver Portfolio', url: 'proyectos.html' },
                { text: 'Hablar con Jesús por WhatsApp', url: WHATSAPP_URL, external: true },
                { text: 'Solicitar Presupuesto', url: 'presupuesto.html' }
            ]
        },
        {
            id: 'contact_start',
            category: 'contact',
            keywords: [
                'empezar', 'contacto', 'contactar', 'contratar', 'reunion', 'reunión',
                'llamada', 'agenda', 'agendar', 'hablar', 'comenzar', 'pasos', 'email', 'correo', 'telefono', 'teléfono'
            ],
            title: 'Cómo Empezar con JGStudio',
            content: `¡Empezar tu proyecto es muy rápido! Tienes varias opciones:

1. **Configurador de Presupuesto:** Detalla tu proyecto en la [Página de Presupuesto](presupuesto.html) y recibe una propuesta formal en 24h.
2. **WhatsApp Directo:** Escríbenos por [WhatsApp directo](` + WHATSAPP_URL + `) para hablar al instante con Jesús.
3. **Por este Chat:** Escribe aquí tu **email, nombre o teléfono** y te contactaremos hoy mismo.`,
            suggestions: [
                { text: 'Configurar Presupuesto', url: 'presupuesto.html' },
                { text: 'Escribir por WhatsApp', url: WHATSAPP_URL, external: true }
            ]
        }
    ];

    // ─────────────────────────────────────────────────────────────
    // 2. MOTOR RAG & ENRUTADOR SEMÁNTICO
    // ─────────────────────────────────────────────────────────────
    class RAGEngine {
        constructor(knowledgeBase) {
            this.kb = knowledgeBase;
            this.stopWords = new Set([
                'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un', 'para',
                'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'más', 'pero', 'sus', 'le', 'ya',
                'o', 'este', 'si', 'porque', 'esta', 'son', 'entre', 'cuando', 'muy', 'sin', 'es', 'son',
                'sobre', 'me', 'nos', 'mi', 'mis', 'te', 'ti', 'hola', 'buenas', 'buenos', 'favor',
                'quisiera', 'quiero', 'gustaria', 'gustaría', 'cual', 'cuál', 'dime', 'saber'
            ]);
        }

        normalize(text) {
            return (text || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        tokenize(text) {
            const clean = this.normalize(text);
            return clean
                .split(' ')
                .filter(w => w.length > 2 && !this.stopWords.has(w));
        }

        findBestChunk(query, previousUserMessages = []) {
            const normQuery = this.normalize(query);
            const queryTokens = this.tokenize(query);

            let bestChunk = null;
            let highestScore = -1;

            for (const chunk of this.kb) {
                let score = 0;

                // 1. Coincidencia directa de frases o palabras clave en la consulta actual (MÁXIMA PRIORIDAD)
                for (const kw of chunk.keywords) {
                    const normKw = this.normalize(kw);
                    if (normQuery === normKw) {
                        score += 120; // Coincidencia exacta
                    } else if (normQuery.includes(normKw)) {
                        score += 50 + normKw.length * 2;
                    }
                }

                // 2. Coincidencia por tokens individuales de la consulta actual
                const chunkTokens = new Set(this.tokenize(chunk.title + ' ' + chunk.keywords.join(' ') + ' ' + chunk.content));
                for (const token of queryTokens) {
                    if (chunkTokens.has(token)) {
                        score += 15;
                    }
                }

                if (score > highestScore) {
                    highestScore = score;
                    bestChunk = chunk;
                }
            }

            // Si el score directo es claro, devolver inmediatamente
            if (highestScore >= 30) {
                return { chunk: bestChunk, score: highestScore };
            }

            // Si la consulta es corta o ambigua (ej: "y cuánto?", "en qué tiempo?"), revisar solo el último mensaje del USUARIO
            if (previousUserMessages.length > 0) {
                const lastUserMsg = previousUserMessages[previousUserMessages.length - 1];
                const lastUserTokens = this.tokenize(lastUserMsg);

                for (const chunk of this.kb) {
                    let contextScore = 0;
                    const chunkTokens = new Set(this.tokenize(chunk.title + ' ' + chunk.keywords.join(' ')));
                    for (const token of lastUserTokens) {
                        if (chunkTokens.has(token)) {
                            contextScore += 5;
                        }
                    }
                    // Si la consulta actual tiene intención (ej: precio) pero faltaba sujeto, enriquecer
                    if (contextScore > 0 && highestScore > 0 && bestChunk) {
                        return { chunk: bestChunk, score: highestScore + contextScore };
                    }
                }
            }

            return highestScore > 10 ? { chunk: bestChunk, score: highestScore } : null;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. EXTRACTOR INTELIGENTE DE LEADS & GOOGLE SHEETS
    // ─────────────────────────────────────────────────────────────
    class LeadExtractor {
        constructor() {
            this.capturedLead = {
                email: null,
                phone: null,
                name: null,
                projectInterest: null,
                alreadySent: false
            };
        }

        extract(text) {
            let foundNewInfo = false;

            // Extraer Email
            const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
            const emailMatch = text.match(emailRegex);
            if (emailMatch && !this.capturedLead.email) {
                this.capturedLead.email = emailMatch[1].trim();
                foundNewInfo = true;
            }

            // Extraer Teléfono
            const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
            const phoneMatch = text.match(phoneRegex);
            if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 9 && !this.capturedLead.phone) {
                this.capturedLead.phone = phoneMatch[0].trim();
                foundNewInfo = true;
            }

            // Extraer Nombre
            const namePatterns = [
                /(?:me llamo|mi nombre es|soy)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]{2,20}(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]{2,20})?)/i,
                /(?:un saludo de|aqui|aquí)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]{2,20})/i
            ];
            for (const pattern of namePatterns) {
                const nameMatch = text.match(pattern);
                if (nameMatch && !this.capturedLead.name) {
                    const extractedName = nameMatch[1].trim();
                    const invalidWords = ['interesado', 'cliente', 'desarrollador', 'hola', 'buenas', 'alguien', 'quiero', 'busco'];
                    if (!invalidWords.includes(extractedName.toLowerCase())) {
                        this.capturedLead.name = extractedName;
                        foundNewInfo = true;
                        break;
                    }
                }
            }

            // Detectar interés
            const textLower = text.toLowerCase();
            if (textLower.includes('web') || textLower.includes('landing')) this.capturedLead.projectInterest = 'Desarrollo Web / Landing';
            else if (textLower.includes('app') || textLower.includes('saas') || textLower.includes('fitness') || textLower.includes('crossfit') || textLower.includes('rival')) this.capturedLead.projectInterest = 'App / SaaS / Plataforma';
            else if (textLower.includes('automatiz') || textLower.includes('ia') || textLower.includes('bot') || textLower.includes('n8n')) this.capturedLead.projectInterest = 'Automatización con IA';
            else if (textLower.includes('branding') || textLower.includes('video') || textLower.includes('diseñ')) this.capturedLead.projectInterest = 'Branding & Contenido';

            return {
                lead: this.capturedLead,
                hasEmailOrPhone: Boolean(this.capturedLead.email || this.capturedLead.phone),
                foundNewInfo
            };
        }

        async syncToGoogleSheets(customMessage = '') {
            if (!this.capturedLead.email && !this.capturedLead.phone) return false;
            if (this.capturedLead.alreadySent) return true;

            const payload = new URLSearchParams();
            payload.append('name', this.capturedLead.name || 'Lead Chatbot IA');
            payload.append('_replyto', this.capturedLead.email || 'no-email@chat.jgstudio');
            payload.append('phone', this.capturedLead.phone || '');
            payload.append('tipo_proyecto', this.capturedLead.projectInterest || 'Consulta Chatbot IA');
            payload.append('message', `[Lead Asistente Virtual IA] — ${customMessage || 'Capturado automáticamente desde el chat'}`);
            payload.append('region', 'ES');
            payload.append('source', 'Chatbot_AI_RAG');
            payload.append('fecha', new Date().toISOString());

            try {
                await fetch(SHEETS_WEBAPP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body: payload.toString()
                });
                this.capturedLead.alreadySent = true;
                return true;
            } catch (error) {
                console.warn('[JGAIEngine] Error enviando lead a Google Sheets:', error);
                return false;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. FORMATEADOR DE MARKDOWN
    // ─────────────────────────────────────────────────────────────
    function formatMarkdown(text) {
        if (!text) return '';
        
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&lt;br&gt;/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="chat-code">$1</code>')
            .replace(/\[(.*?)\]\((https?:\/\/[^\s]+|[\w-]+\.html(?:[?#][^\s]*)?)\)/g, (match, linkText, url) => {
                const isExt = url.startsWith('http');
                const target = isExt ? ' target="_blank" rel="noopener noreferrer"' : '';
                return `<a href="${url}" class="chat-link"${target}>${linkText} <i class="fas fa-arrow-up-right-from-square" style="font-size:0.7em;"></i></a>`;
            });

        const lines = html.split('\n');
        let inList = false;
        const formattedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const bulletMatch = line.match(/^[•\-]\s+(.*)$/);
            const numMatch = line.match(/^\d+\.\s+(.*)$/);

            if (bulletMatch) {
                if (!inList) {
                    formattedLines.push('<ul class="chat-list">');
                    inList = true;
                }
                formattedLines.push(`<li>${bulletMatch[1]}</li>`);
            } else if (numMatch) {
                if (!inList) {
                    formattedLines.push('<ol class="chat-list chat-list-ordered">');
                    inList = true;
                }
                formattedLines.push(`<li>${numMatch[1]}</li>`);
            } else {
                if (inList) {
                    formattedLines.push('</ul>');
                    inList = false;
                }
                if (line) {
                    formattedLines.push(`<p class="chat-p">${line}</p>`);
                }
            }
        }

        if (inList) {
            formattedLines.push('</ul>');
        }

        return formattedLines.join('');
    }

    // ─────────────────────────────────────────────────────────────
    // 5. MOTOR PRINCIPAL: JGAIEngine
    // ─────────────────────────────────────────────────────────────
    class JGAIEngine {
        constructor() {
            this.rag = new RAGEngine(KNOWLEDGE_BASE);
            this.leadExtractor = new LeadExtractor();
            this.history = [];
        }

        async processUserMessage(userQuery) {
            const trimmed = userQuery.trim();
            if (!trimmed) return null;

            // Extraer solo historial de mensajes del usuario para evitar contaminación
            const userMessagesHistory = this.history
                .filter(m => m.role === 'user')
                .map(m => m.text);

            this.history.push({ role: 'user', text: trimmed, timestamp: new Date() });

            // Extraer datos de lead en background
            const extraction = this.leadExtractor.extract(trimmed);
            if (extraction.foundNewInfo && extraction.hasEmailOrPhone) {
                this.leadExtractor.syncToGoogleSheets(trimmed);
            }

            // Saludos
            const norm = this.rag.normalize(trimmed);
            if (['hola', 'buenas', 'que tal', 'hey', 'buenos dias', 'buenas tardes', 'buen dia'].includes(norm)) {
                const greetingResponse = {
                    text: `¡Hola! 👋 Soy el asistente virtual de **JGStudio**.\n\nPuedo ayudarte con información sobre **tarifas**, **tiempos de entrega**, **desarrollo web**, **automatizaciones con IA** o contarte casos de éxito como **Rival Fit**.\n\n¿Qué tipo de proyecto tienes en mente?`,
                    suggestions: [
                        { text: 'Ver Precios y Tarifas', query: 'cuales son los precios' },
                        { text: 'Caso Rival Fit (Fitness)', query: 'caso rival fit' },
                        { text: 'Automatización con IA', query: 'automatizacion ia' },
                        { text: 'Solicitar Presupuesto', url: 'presupuesto.html' }
                    ],
                    isLeadCaptured: false
                };
                this.history.push({ role: 'assistant', text: greetingResponse.text, timestamp: new Date() });
                return greetingResponse;
            }

            // Si acaba de ingresar email / teléfono
            if (extraction.foundNewInfo && extraction.hasEmailOrPhone) {
                const nameGreeting = extraction.lead.name ? ` **${extraction.lead.name}**` : '';
                const leadResponse = {
                    text: `¡Excelente${nameGreeting}! 🎉\n\nHe guardado tus datos correctamente (**${extraction.lead.email || extraction.lead.phone}**).\n\nJesús Gómez revisará tu consulta y se pondrá en contacto contigo en menos de 24 horas. Si prefieres hablar ahora mismo, también puedes escribirnos por WhatsApp directo.`,
                    suggestions: [
                        { text: 'Hablar por WhatsApp con Jesús', url: WHATSAPP_URL, external: true },
                        { text: 'Configurar Presupuesto online', url: 'presupuesto.html' },
                        { text: 'Ver más Proyectos', url: 'proyectos.html' }
                    ],
                    isLeadCaptured: true
                };
                this.history.push({ role: 'assistant', text: leadResponse.text, timestamp: new Date() });
                return leadResponse;
            }

            // Búsqueda RAG de alta precisión
            const matchResult = this.rag.findBestChunk(trimmed, userMessagesHistory);

            let responseText = '';
            let suggestions = [];

            if (matchResult && matchResult.chunk) {
                responseText = matchResult.chunk.content;
                suggestions = matchResult.chunk.suggestions || [];
            } else {
                responseText = `En **JGStudio** desarrollamos sitios web de alto impacto, plataformas SaaS y automatizaciones con IA a medida.\n\nSi deseas conocer tarifas exactas para tu idea, puedes usar nuestro **configurador de presupuesto** o dejarme tu **email o WhatsApp** aquí mismo.`;
                suggestions = [
                    { text: 'Calcular Presupuesto Online', url: 'presupuesto.html' },
                    { text: 'Ver Tarifas y Precios', query: 'cuales son los precios' },
                    { text: 'Hablar por WhatsApp', url: WHATSAPP_URL, external: true }
                ];
            }

            const finalResponse = {
                text: responseText,
                suggestions: suggestions,
                isLeadCaptured: false
            };

            this.history.push({ role: 'assistant', text: responseText, timestamp: new Date() });
            return finalResponse;
        }

        getHistory() {
            return this.history;
        }

        clearHistory() {
            this.history = [];
        }
    }

    window.JGAIEngine = new JGAIEngine();
    window.jgFormatMarkdown = formatMarkdown;

})(window);
