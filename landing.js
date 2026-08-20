/* =============================================================================
   Pixel mascot — vanilla port of dashboard/src/components/PixelMascot.tsx
   Renders the axolotl sprite into every [data-mascot] element and drives the
   same idle loop, click reaction, and reduced-motion behaviour.
   ============================================================================= */

(function () {
  'use strict'

  var GRID_WIDTH = 12
  var GRID_HEIGHT = 10
  var SVG_NS = 'http://www.w3.org/2000/svg'

  var MASCOT_COLORS = {
    body: 'var(--brand-bruno-coral)',
    eye: 'var(--brand-bruno-eye)',
    cheek: 'color-mix(in oklch, var(--brand-bruno-coral) 52%, var(--brand-bruno-gold-soft))',
    mouth: 'color-mix(in oklch, var(--brand-bruno-eye) 82%, var(--brand-bruno-coral))',
    shine: 'color-mix(in oklch, var(--brand-bruno-gold-soft) 74%, white)',
  }

  var COLORS = {
    0: 'transparent',
    1: MASCOT_COLORS.body,
    2: MASCOT_COLORS.eye,
    3: MASCOT_COLORS.cheek,
    4: MASCOT_COLORS.mouth,
    5: MASCOT_COLORS.shine,
  }

  var LOWER_CHEEK_ROW_INDEX = 6
  var BOTTOM_ROW_INDEX = 7
  var CHIN_ROW_INDEX = 8
  var LOWER_CHEEK_ROW = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  var ROUNDED_BOTTOM_ROW = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
  var ROUNDED_CHIN_ROW = [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0]

  var frames = {
    rest: [
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,1,1,0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,2,1,1,1,1,2,1,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    blink: [
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,1,1,0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,4,4,1,1,4,4,1,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    earLeft: [
      [0,1,1,0,0,0,0,0,0,1,0,0],
      [0,0,1,0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,2,1,1,1,1,2,1,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    earRight: [
      [0,0,1,0,0,0,0,0,0,1,1,0],
      [0,1,1,0,0,0,0,0,0,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,2,1,1,1,1,2,1,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    perked: [
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,2,1,1,1,1,2,1,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    squish: [
      [0,1,1,0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,2,1,1,1,1,2,1,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,0,0,0,0,1,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    lookLeft: [
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,1,1,0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,2,1,1,1,1,2,1,1,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    lookRight: [
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,1,1,0,0,0,0,0,0,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,5,1,1,1,1,1,1],
      [1,1,1,1,2,1,1,1,1,2,1,1],
      [1,1,3,1,1,4,4,1,1,3,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  }

  var AXOLOTL_GILL_RECTS = [
    { x: -1, y: 3, width: 1, height: 1, fill: MASCOT_COLORS.body },
    { x: -1, y: 4, width: 1, height: 1, fill: MASCOT_COLORS.cheek },
    { x: -2, y: 4, width: 1, height: 1, fill: MASCOT_COLORS.cheek },
    { x: -1, y: 5, width: 1, height: 1, fill: MASCOT_COLORS.body },
    { x: 12, y: 3, width: 1, height: 1, fill: MASCOT_COLORS.body },
    { x: 12, y: 4, width: 1, height: 1, fill: MASCOT_COLORS.cheek },
    { x: 13, y: 4, width: 1, height: 1, fill: MASCOT_COLORS.cheek },
    { x: 12, y: 5, width: 1, height: 1, fill: MASCOT_COLORS.body },
  ]

  var idleSequence = [
    { frame: 'rest', hold: 2400, transform: 'translateY(0) scale(1)' },
    { frame: 'blink', hold: 110, transform: 'translateY(0) scale(1)' },
    { frame: 'rest', hold: 1500, transform: 'translateY(0) scale(1)' },
    { frame: 'lookLeft', hold: 420, transform: 'translateY(0) rotate(-1deg)' },
    { frame: 'rest', hold: 1500, transform: 'translateY(0) scale(1)' },
    { frame: 'lookRight', hold: 420, transform: 'translateY(0) rotate(1deg)' },
    { frame: 'rest', hold: 2600, transform: 'translateY(0) scale(1)' },
    { frame: 'earLeft', hold: 130, transform: 'translateY(0) rotate(-1deg)' },
    { frame: 'earRight', hold: 130, transform: 'translateY(0) rotate(1deg)' },
    { frame: 'perked', hold: 220, transform: 'translateY(-1px) scale(1.03)' },
    { frame: 'rest', hold: 3600, transform: 'translateY(0) scale(1)' },
    { frame: 'squish', hold: 150, transform: 'translateY(1px) scaleX(1.05) scaleY(0.94)' },
    { frame: 'rest', hold: 3200, transform: 'translateY(0) scale(1)' },
  ]

  var clickSequence = [
    { frame: 'squish', hold: 120, transform: 'translateY(1px) scaleX(1.08) scaleY(0.92)' },
    { frame: 'perked', hold: 130, transform: 'translateY(-3px) scale(1.07)' },
    { frame: 'earLeft', hold: 110, transform: 'translateY(-1px) rotate(-4deg)' },
    { frame: 'earRight', hold: 120, transform: 'translateY(-1px) rotate(4deg)' },
  ]

  function shapeAxolotlFrame(frame) {
    return frame.map(function (row, index) {
      if (index === LOWER_CHEEK_ROW_INDEX) return LOWER_CHEEK_ROW
      if (index === BOTTOM_ROW_INDEX) return ROUNDED_BOTTOM_ROW
      if (index === CHIN_ROW_INDEX) return ROUNDED_CHIN_ROW
      return row
    })
  }

  function pixelClass(pixel) {
    if (pixel === 2) return 'bruno-mascot-eye'
    if (pixel === 3) return 'bruno-mascot-cheek'
    if (pixel === 5) return 'bruno-mascot-shine'
    return null
  }

  function rect(x, y, width, height, fill, className) {
    var node = document.createElementNS(SVG_NS, 'rect')
    node.setAttribute('x', x)
    node.setAttribute('y', y)
    node.setAttribute('width', width)
    node.setAttribute('height', height)
    node.setAttribute('fill', fill)
    if (className) node.setAttribute('class', className)
    return node
  }

  function createMascot(host) {
    var size = Number(host.getAttribute('data-size')) || 64
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    var svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('class', 'bruno-mascot-sprite')
    svg.setAttribute('width', size)
    svg.setAttribute('height', size * (GRID_HEIGHT / GRID_WIDTH))
    svg.setAttribute('viewBox', '0 0 ' + GRID_WIDTH + ' ' + GRID_HEIGHT)
    svg.style.overflow = 'visible'
    host.appendChild(svg)

    var gills = document.createElementNS(SVG_NS, 'g')
    AXOLOTL_GILL_RECTS.forEach(function (r) {
      gills.appendChild(rect(r.x, r.y, r.width, r.height, r.fill))
    })
    svg.appendChild(gills)

    var body = document.createElementNS(SVG_NS, 'g')
    svg.appendChild(body)

    var timer = null
    var step = 0
    var clicking = false

    function paint(frameName, transform) {
      var data = shapeAxolotlFrame(frames[frameName])
      while (body.firstChild) body.removeChild(body.firstChild)
      data.forEach(function (row, y) {
        row.forEach(function (pixel, x) {
          if (pixel === 0) return
          body.appendChild(rect(x, y, 1, 1, COLORS[pixel], pixelClass(pixel)))
        })
      })
      svg.style.transform = transform
    }

    function runIdle() {
      if (clicking || reduceMotion.matches) return
      var current = idleSequence[step % idleSequence.length]
      paint(current.frame, current.transform)
      timer = window.setTimeout(function () {
        step = (step + 1) % idleSequence.length
        runIdle()
      }, current.hold)
    }

    function playClick(index) {
      var current = clickSequence[index]
      paint(current.frame, current.transform)
      timer = window.setTimeout(function () {
        if (index + 1 < clickSequence.length) {
          playClick(index + 1)
          return
        }
        clicking = false
        step = 0
        paint('rest', 'translateY(0) scale(1)')
        runIdle()
      }, current.hold)
    }

    host.addEventListener('click', function () {
      if (clicking || reduceMotion.matches) return
      clicking = true
      window.clearTimeout(timer)
      playClick(0)
    })

    function sync() {
      window.clearTimeout(timer)
      clicking = false
      step = 0
      if (reduceMotion.matches) {
        paint('rest', 'translateY(0) scale(1)')
        return
      }
      runIdle()
    }

    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', sync)
    } else if (reduceMotion.addListener) {
      reduceMotion.addListener(sync)
    }

    sync()
  }

  function init() {
    var hosts = document.querySelectorAll('[data-mascot]')
    Array.prototype.forEach.call(hosts, createMascot)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
