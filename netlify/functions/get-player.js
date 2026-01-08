const axios = require('axios');

exports.handler = async (event, context) => {
  // Solo permitimos peticiones POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { game, playerTag } = JSON.parse(event.body);
  
  // Estas son las variables que configuraremos en el panel de Netlify
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

  try {
    const response = await axios.get(`${BASE_URLS[game]}${encodedTag}`, {
      headers: {
        'Authorization': `Bearer ${KEYS[game]}`,
        'Accept': 'application/json'
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: "Error al obtener datos de Supercell" })
    };
  }
};