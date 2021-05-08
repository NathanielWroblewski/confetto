import Vector from '../models/vector.js'
import { lerp, range } from './index.js'
import TRIANGULATION_TABLE from '../constants/triangulation_table.js'

const getState = (a, b, c, d, e, f, g, h) => {
  return a * 1 + b * 2 + c * 4 + d * 8 + e * 16 + f * 32 + g * 64 + h * 128
}

const getCubeEdges = (x, y, z, res, values) => {
  return [
    Vector.from([
      lerp(x, x + res, (1 - values[0]) / (values[1] - values[0])),
      y,
      z
    ]),
    Vector.from([
      x + res,
      y,
      lerp(z, z + res, (1 - values[1]) / (values[2] - values[1]))
    ]),
    Vector.from([
      lerp(x, x + res, (1 - values[3]) / (values[2] - values[3])),
      y,
      z + res
    ]),
    Vector.from([
      x,
      y,
      lerp(z, z + res, (1 - values[0]) / (values[3] - values[0]))
    ]),
    Vector.from([
      lerp(x, x + res, (1 - values[4]) / (values[5] - values[4])),
      y + res,
      z
    ]),
    Vector.from([
      x + res,
      y + res,
      lerp(z, z + res, (1 - values[5]) / (values[6] - values[5]))
    ]),
    Vector.from([
      lerp(x, x + res, (1 - values[7]) / (values[6] - values[7])),
      y + res,
      z + res
    ]),
    Vector.from([
      x,
      y + res,
      lerp(z, z + res, (1 - values[4]) / (values[7] - values[4]))
    ]),
    Vector.from([
      x,
      lerp(y, y + res, (1 - values[0]) / (values[4] - values[0])),
      z
    ]),
    Vector.from([
      x + res,
      lerp(y, y + res, (1 - values[1]) / (values[5] - values[1])),
      z
    ]),
    Vector.from([
      x + res,
      lerp(y, y + res, (1 - values[2]) / (values[6] - values[2])),
      z + res
    ]),
    Vector.from([
      x,
      lerp(y, y + res, (1 - values[3]) / (values[7] - values[3])),
      z + res
    ])
  ]
}

const getValues = (i, j, k, volume) => {
  return [
    volume[i][j][k] + 1,
    volume[i + 1][j][k] + 1,
    volume[i + 1][j][k + 1] + 1,
    volume[i][j][k + 1] + 1,
    volume[i][j + 1][k] + 1,
    volume[i + 1][j + 1][k] + 1,
    volume[i + 1][j + 1][k + 1] + 1,
    volume[i][j + 1][k + 1] + 1
  ]
}

export const marchingCubes = ({ from, to, by, res, volume }) => {
  const vertices = []

  const xs = range(from[0], to[0], by[0])
  const ys = range(from[1], to[1], by[1])
  const zs = range(from[2], to[2], by[2])

  xs.forEach(i => {
    const x = i * res

    ys.forEach(j => {
      const y = j * res

      zs.forEach(k => {
        const z = k * res
        const values = getValues(i, j, k, volume)
        const edges = getCubeEdges(x, y, z, res, values)
        const state = getState(
          Math.ceil(volume[i][j][k]),
          Math.ceil(volume[i + 1][j][k]),
          Math.ceil(volume[i + 1][j][k + 1]),
          Math.ceil(volume[i][j][k + 1]),
          Math.ceil(volume[i][j + 1][k]),
          Math.ceil(volume[i + 1][j + 1][k]),
          Math.ceil(volume[i + 1][j + 1][k + 1]),
          Math.ceil(volume[i][j + 1][k + 1])
        )

        TRIANGULATION_TABLE[state].forEach(edgeIndex => {
          if (edgeIndex !== -1) {
            vertices.push(edges[edgeIndex])
          }
        })
      })
    })
  })

  return vertices
}
