const axios = require('axios');

exports.handler = async (event, context) => {
  // 1. Cabeceras de seguridad (CORS) para que tu web pueda recibir los datos
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 2. Responder a la petición de "pre-vuelo" del navegador
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  // 3. Solo permitir peticiones POST
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: "Método no permitido. Usa POST." }) 
    };
  }

  try {
    const { game, playerTag } = JSON.parse(event.body);
    
    // 4. Variables de entorno configuradas en Netlify
    const KEYS = {
      coc: process.env.COC_API_KEY,
      cr: process.env.CR_API_KEY,
      bs: process.env.BS_API_KEY
    };

    const BASE_URLS = {
      coc: 'https://api.clashofclans.com/v1/players/',
      cr: 'https://api.clashroyale.com/v1/players/',
      bs: 'https://api.brawlstars.com/v1/players/'
    };

    const cleanTag = playerTag.replace('#', '').toUpperCase();
    const encodedTag = encodeURIComponent(`#${cleanTag}`);

    // 5. Llamada a la API de Supercell
    const response = await axios.get(`${BASE_URLS[game]}${encodedTag}`, {
      headers: {
        'Authorization': `Bearer ${KEYS[game]}`,
        'Accept': 'application/json'
      }
    });

    // 6. Respuesta exitosa
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };

  } catch (error) {
    console.error("Error en la función:", error.response ? error.response.data : error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({ 
        error: "Error al obtener datos de Supercell",
        details: error.response?.data || error.message
      })
    };
  }
};
