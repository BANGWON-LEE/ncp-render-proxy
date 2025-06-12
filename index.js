const express = require('express')
const axios = require('axios')
const compression = require('compression')

const app = express()

app.use(compression()) // gzip 압축 적용
const PORT = process.env.PORT || 3000

function downsamplePath(path, max = 50) {
  if (!Array.isArray(path) || path.length <= max) return path

  const step = Math.ceil(path.length / max)
  return path.filter((_, index) => index % step === 0)
}

function reducePrecision(path) {
  return path.map(([lng, lat]) => [
    parseFloat(lng.toFixed(5)),
    parseFloat(lat.toFixed(5)),
  ])
}
app.get('/driving', async (req, res) => {
  const { start, goal } = req.query

  try {
    const result = await axios.get(
      `https://maps.apigw.ntruss.com/map-direction/v1/driving?goal=${goal}&start=${start}`,
      {
        headers: {
          'x-ncp-apigw-api-key-id': process.env.NCP_APIGW_API_KEY_ID,
          'x-ncp-apigw-api-key': process.env.NCP_APIGW_API_KEY,
        },
      }
    )

    const route = result.data.route?.traoptimal?.[0]
    const fullPath = route.path || []
    const simplified = downsamplePath(fullPath, 200)

    const summary = {
      distance: route.summary?.distance,
      duration: route.summary?.duration,
      start: route.summary?.start,
      goal: route.summary?.goal,
    }
    const reduced = reducePrecision(simplified)

    res.json({
      summary,
      path: reduced,
    })
  } catch (err) {
    console.error('[DRIVING ERROR]', err.response?.data || err.message)
    res.status(500).json({
      message: '프록시 서버 오류',
      detail: err.response?.data || err.message,
    })
  }
})

app.get('/walking', async (req, res) => {
  const { start, goal } = req.query

  try {
    const result = await axios.get(
      `https://maps.apigw.ntruss.com/map-direction/v1/walking?goal=${goal}&start=${start}`,
      {
        headers: {
          'x-ncp-apigw-api-key-id': process.env.NCP_APIGW_API_KEY_ID,
          'x-ncp-apigw-api-key': process.env.NCP_APIGW_API_KEY,
        },
      }
    )

    // const route = result.data.route?.traoptimal?.[0]
    // const fullPath = route.path || []
    // const simplified = downsamplePath(fullPath, 200)

    // const summary = {
    //   distance: route.summary?.distance,
    //   duration: route.summary?.duration,
    //   start: route.summary?.start,
    //   goal: route.summary?.goal,
    // }
    // const reduced = reducePrecision(simplified)

    // res.json({
    //   summary,
    //   path: reduced,
    // })
    console.log('걷기', result)
    res.json({ result })
  } catch (err) {
    console.error('[DRIVING ERROR]', err.response?.data || err.message)
    res.status(500).json({
      message: '프록시 서버 오류',
      detail: err.response?.data || err.message,
    })
  }
})

app.listen(PORT, () => {
  console.log(`Proxy server running on ${PORT}`)
})
