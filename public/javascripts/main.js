import Vector from './models/vector.js'
import FourByFour from './models/four_by_four.js'
import Camera from './models/orthographic.js'
import angles from './isomorphisms/angles.js'
import renderPolygon from './views/polygon.js'
import { seed, noise } from './utilities/noise.js'
import { marchingCubes } from './utilities/marches.js'
import { remap, cube } from './utilities/index.js'
import { COLORS, LIGHT_GREY } from './constants/colors.js'
import { Δt, MODULUS, AMPLITUDE, RESOLUTION, ZOOM, TIME_RESET } from './constants/dimensions.js'

// Copyright (c) 2020 Nathaniel Wroblewski
// I am making my contributions/submissions to this project solely in my personal
// capacity and am not conveying any rights to any intellectual property of any
// third parties.

const canvas = document.querySelector('.canvas')
const context = canvas.getContext('2d')
const { sin, cos } = Math

seed(Math.random())

const perspective = FourByFour
  .identity()
  .rotX(angles.toRadians(20))
  .rotY(angles.toRadians(40))

const camera = new Camera({
  position: Vector.from([0,0,0]),
  direction: Vector.zeroes(),
  up: Vector.from([0, 1, 0]),
  width: canvas.width,
  height: canvas.height,
  zoom: 0.05
})

const from = Vector.from([0, 0, 0])
const to = Vector.from([20, 40, 5])
const by = Vector.from([1, 1, 1])

const volume = []

let time = 0

const step = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)

  cube({ from, to, by }, ([x, y, z]) => {
    if (!Array.isArray(volume[x])) volume[x] = []
    if (!Array.isArray(volume[x][y])) volume[x][y] = []

    const value = -y + (
      ((noise((x + time) * RESOLUTION, y * RESOLUTION, (z + time) * RESOLUTION) + 1)/2) * AMPLITUDE
      ) + (y % MODULUS)

    volume[x][y][z] = remap(value, [-to.y, AMPLITUDE + ((to.y - 1) % MODULUS)], [-1, 1])
  })

  const vertices = marchingCubes({ from, to: to.subtract(1), by, res: 1, volume }).map(point => {
    return point.subtract(to.multiply(0.5))
  })

  const faces = []

  for (let i = 0; i < vertices.length; i += 3) {
    faces.push([vertices[i], vertices[i + 1], vertices[i + 2]])
  }

  faces.map(triangle => {
    const point = triangle[0]
    const colorIndex = Math.floor(remap(point.y, [-AMPLITUDE/2, AMPLITUDE/2], [0, COLORS.length - 1]))
    const fill = COLORS[colorIndex]
    const face = triangle.map(point => camera.project(point.transform(perspective)))

    renderPolygon(context, face, LIGHT_GREY, fill)
  })

  time += Δt

  if (time === TIME_RESET) time = 0
  window.requestAnimationFrame(step)
}

step()
