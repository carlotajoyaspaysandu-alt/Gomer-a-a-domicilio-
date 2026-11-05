export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { mensaje, historial } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Falta configurar la GEMINI_API_KEY en Vercel' });
    }

    const systemPrompt = `
      Eres el asistente virtual oficial de "Gomería a Domicilio y Auxilio Mecánico" (especializado en motos y vehículos).
      Tu tono debe ser amigable, servicial, directo y enfocado en ayudar al cliente rápidamente.

      INFORMACIÓN OFICIAL DEL NEGOCIO:
      - Servicios y Precios:
        * Pinchaduras: $200
        * Cambios de aceite: $180
        * Cambio de transmisión: $300
      - Horario de atención regular: Lunes a Sábados de 9:00 a 19:00 hs.
      - Nota importante sobre horarios: Fuera de ese horario o emergencias nocturnas, el servicio tiene un costo extra.
      - Teléfonos de contacto / WhatsApp: 096643887 - 098866160.

      Tus reglas:
      1. Responde de forma clara y concisa a las dudas de los clientes sobre los precios o servicios.
      2. Si te preguntan por horarios o costos fuera de hora, recuérdales las tarifas base y que fuera de horario tiene costo extra, invitándolos a comunicarse por los teléfonos facilitados.
      3. Si necesitan contratar el servicio, aliéntalos a llamar o escribir a los números de contacto (096643887 o 098866160).
    `;

    // Estructura simplificada y compatible con la API de Gemini
    let contents = [];

    if (historial && Array.isArray(historial)) {
      historial.forEach((item) => {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nCliente: ${mensaje}` }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error en Gemini API:", data);
      throw new Error(data.error?.message || "Error al comunicarse con la API de Gemini");
    }

    const respuestaIA = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar una respuesta.";

    return res.status(200).json({ respuesta: respuestaIA });

  } catch (error) {
    console.error("Error en la función handler:", error);
    return res.status(500).json({ error: "Error interno procesando la solicitud." });
  }
}
