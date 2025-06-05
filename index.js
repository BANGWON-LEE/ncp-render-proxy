const express = require('express')
const axios = require('axios')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

app.get('/driving', async (req, res) => {
  const { start, goal } = req.query

  try {
    const result = await axios.get(
      `https://maps.apigw.ntruss.com/map-direction/v1/driving?start=${start}&goal=${goal}`,
      {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': process.env.NCP_APIGW_API_KEY_ID,
          'X-NCP-APIGW-API-KEY': process.env.NCP_APIGW_API_KEY,
        },
      }
    )

    res.json(result.data)
  } catch (err) {
    console.error('[DRIVING ERROR]', err.response?.data || err.message)
    res.status(500).json({
      message: '프록시 서버 오류',
      detail: err.response?.data || err.message,
    })
  }
})

app.get('/my-ip', async (req, res) => {
  const result = await axios.get('https://api64.ipify.org?format=json')
  res.json(result.data) // 예: { ip: "44.226.122.3" }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on ${PORT}`)
})
