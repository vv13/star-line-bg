class Star {
  static easingFactor = 5
  static starColor = '#fff'

  constructor(ctx, options) {
    this.starGroup = []
    this.ctx = ctx
    this.elWidth = this.ctx.canvas.clientWidth
    this.elHeight = this.ctx.canvas.clientHeight
    this.options = options
  }

  initStars() {
    const starGroup = []
    for (let i = 0; i < this.options.starNumber; i += 1) {
      this.starGroup.push({
        drivenByMouse: i === 0,
        x: Math.random() * this.elWidth,
        y: Math.random() * this.elHeight,
        vx: Math.random() - 0.5,
        vy: Math.random() - 0.5,
        radius: 1 + (Math.random() * 2),
        globalAlpha: 0.5 + (Math.random() * 0.5),
      })
    }
    this.starGroup.forEach((e1) => {
      this.starGroup.forEach((e2) => {
        if (e1 === e2) return
        const line = {
          from: e1,
          to: e2,
        }
        starGroup.push(line)
      })
    })
    return starGroup
  }

  drive() {
    this.starGroup.forEach((e) => {
      if (e.drivenByMouse) return
      e.x += e.vx
      e.y += e.vy

      const fix = (max, value) => {
        if (value < 0) return 0
        return value > max ? max : value
      }

      if (e.x <= 0 || e.x >= this.elWidth) {
        e.vx *= -1
        e.x = fix(this.elWidth, e.x)
      }
      if (e.y <= 0 || e.y >= this.elHeight) {
        e.vy *= -1
        e.y = fix(this.elHeight, e.y)
      }
    })
  }

  adjustStarDrivenByMouse(mousePos) {
    this.starGroup[0].x += (mousePos[0] - this.starGroup[0].x) / Star.easingFactor
    this.starGroup[0].y += (mousePos[1] - this.starGroup[0].y) / Star.easingFactor
  }

  render() {
    this.starGroup.forEach((e) => {
      if (e.drivenByMouse) return
      this.ctx.globalAlpha = e.globalAlpha
      this.ctx.fillStyle = Star.starColor
      this.ctx.beginPath()
      this.ctx.arc(e.x, e.y, e.radius, 0, 2 * Math.PI)
      this.ctx.fill()
      this.ctx.globalAlpha = 1
    })
  }
}

class Line {
  static edgeColor = '#fff'
  static lengthOfLine = edge =>
    Math.sqrt(((edge.from.x - edge.to.x) ** 2) + ((edge.from.y - edge.to.y) ** 2))

  constructor(ctx, options) {
    this.edges = []
    this.ctx = ctx
    this.threshold = options.threshold
  }

  add(edge) {
    for (let i = 0; i < this.edges.length; i += 1) {
      if (
        (this.edges[i].from === edge.from && this.edges[i].to === edge.to) ||
        (this.edges[i].to === edge.from && this.edges[i].from === edge.to)
      ) {
        return
      }
    }
    this.edges.push(edge)
  }

  render() {
    this.edges.forEach((e) => {
      const l = Line.lengthOfLine(e)
      if (l > this.threshold) return
      this.ctx.strokeStyle = Line.edgeColor
      this.ctx.lineWidth = (1.0 - (l / this.threshold)) * 2.5
      this.ctx.globalAlpha = 1.0 - (l / this.threshold)
      this.ctx.beginPath()
      this.ctx.moveTo(e.from.x, e.from.y)
      this.ctx.lineTo(e.to.x, e.to.y)
      this.ctx.stroke()
    })
    this.ctx.globalAlpha = 1
  }
}

export default class StarLine {
  static defaultOptions = {
    threshold: 100, // 两点间连线最大距离
    canvasBgColor: 'rgba(255, 255, 255, 0)', // canvas的背景颜色
    starNumber: 30, // star Number
    autoRun: true, // auto start
  }

  mousePos = [0, 0] // 鼠标位置
  runnerId // requestAnimationFrame id

  constructor(el, options) {
    this.el = document.querySelector(el)
    this.options = Object.assign({}, StarLine.defaultOptions, options)
    this.ctx = this.el.getContext('2d')
    this.line = new Line(this.ctx, this.options)
    this.star = new Star(this.ctx, this.options)

    if (this.options.autoRun) {
      this.run()
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.el.clientWidth, this.el.clientHeight)
    this.ctx.fillStyle = this.options.canvasBgColor
    this.ctx.fillRect(0, 0, this.el.clientHeight, this.el.clientHeight)
    this.line.render()
    this.star.render()
  }

  reRender(options) {
    window.cancelAnimationFrame(this.runnerId)
    this.options = Object.assign({}, StarLine.defaultOptions, options)
    this.line = new Line(this.ctx, this.options)
    this.star = new Star(this.ctx, this.options)
    this.run()
  }

  run() {
    this.el.width = this.el.clientWidth
    this.el.height = this.el.clientHeight
    if (this.star.starGroup.length === 0) {
      const starGroup = this.star.initStars()
      starGroup.forEach(star => {
        this.line.add(star)
      })
    }
    this.star.drive()
    this.star.adjustStarDrivenByMouse(this.mousePos)
    this.render()
    this.runnerId = window.requestAnimationFrame(this.run.bind(this))
  }
}
