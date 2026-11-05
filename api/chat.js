import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Permitir CORS para que tu web en GitHub Pages pueda hablar con Vercel
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

    // Prompt del Sistema con la información exacta del servicio
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

    const messages = [
      { role: "system", content: systemPrompt },
      ...(historial || []),
      { role: "user", content: mensaje }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
    });

    const respuestaIA = completion.choices[0].message.content;

    return res.status(200).json({ respuesta: respuestaIA });

  } catch (error) {
    console.error("Error en la API:", error);
    return res.status(500).json({ error: "Hubo un error procesando tu solicitud." });
  }
}
