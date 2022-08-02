import { isMobile, getStyle, throttle } from './utils'


export default class TurntableGesture {
  constructor(element, options) {
    this.initElement(element)
    this.initOptions(options)
    this.initData()
    this.initAngle()
    this.addEventListener()
  }

  initElement(element) {
    if (typeof element === 'string') {
      this.$element = document.querySelector(element)
    } else {
      this.$element = element
    }
  }

  // 初始化配置项
  initOptions(options) {
    this.options = Object.assign({
      sensitivity: 1, // 灵敏度
      direction: 'all', // 允许转动方向
      initialAngle: 0, // 初始角度
    }, options)
  }

  // 初始化信息
  initData() {
    this.onListener = {} // 回调时间组
    this.angle = 0 // 旋转角度
    this.startTag = false // 手势动作是否开始
    this.moveHandler = ['mousemove', 'touchmove']
    this.startHandler = ['mousedown', 'touchstart']
    this.endHandler = ['mouseup', 'touchend']

    this.handleStart = this.start.bind(this)
    this.handleMove = this.move()
    this.handleEnd = this.end.bind(this)

    this.isMobile = isMobile() // 是否是移动端
    this.getTransformMatrix() // 获取dom的默认transform属性矩阵信息
  }

  // 初始化旋转角度
  initAngle() {
    const initialAngle = this.options.initialAngle
    if (initialAngle) {
      let radian = (initialAngle / 180) * Math.PI
      let matrix = this.cMatrix(radian)
      let rotateMatrix = this.cTransformMatrix(this.transformMatrix, matrix)
      this.rotate(rotateMatrix, initialAngle)
    }
  }

  emptyData() {
    this.$element = null
    this.onListener = null
    this.angle = null
    this.startTag = null
    this.moveHandler = null
    this.startHandler = null
    this.endHandler = null

    this.handleStart = null
    this.handleMove = null
    this.handleEnd = null
    this.isMobile = null

    this.options = null
  }

  // 设置中心点
  setCenterPoint(x, y) {
    this.centerPoint = [x, y]
  }

  // 设置起始点
  setFristPoint(x, y) {
    const px = x - this.centerPoint[0]
    const py = this.centerPoint[1] - y

    this.fristPoint = [px, py]
  }

  // 设置最后一个点
  setLastPoint(x, y) {
    const px = x - this.centerPoint[0]
    const py = this.centerPoint[1] - y
    this.lastPoint = [px, py]
  }

  cMatrix(radian) {
    // console.log('mmmmm',radian)
    let matrix = []
    let m_sin_ab = Math.sin(radian)
    let m_con_ab = Math.cos(radian)

    matrix = [m_con_ab, m_sin_ab, -m_sin_ab, m_con_ab, 0, 0]

    return matrix
  }

  // 获取dom节点的transform属性矩阵信息
  getTransformMatrix() {
    const matrixStr = getStyle(this.$element, 'transform')
    const matrixExec = /\((.*)\)/.exec(matrixStr)

    if (matrixExec) {
      this.transformMatrix = matrixExec[1].split(',')
    } else {
      this.transformMatrix = false
    }
  }

  // 计算旋转的 信息
  cRotateMatrix() {
    const ax = this.fristPoint[0],
      ay = this.fristPoint[1],
      bx = this.lastPoint[0],
      by = this.lastPoint[1]
    const a_b = ax * bx + ay * by

    const a_b_mod = Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by)

    const cos_ab = a_b / a_b_mod

    const radian_abs = Math.acos(cos_ab.toFixed(4)) / this.options.sensitivity

    const axb = ax * by - ay * bx // ab两向量叉积，判断旋转方向

    let matrix = []
    let angle
    let radian

    if (axb < 0) {
      radian = radian_abs
    } else {
      radian = -radian_abs
    }
    angle = radian * (180 / Math.PI)

    matrix = this.cMatrix(radian)

    return { matrix, angle }
  }

  // 计算旋转之后的矩阵
  cTransformMatrix(oldMatrix, rotateMatrix) {
    if (oldMatrix) {
      const a =
        oldMatrix[0] * rotateMatrix[0] +
        oldMatrix[2] * rotateMatrix[1] +
        oldMatrix[4] * 0
      const c =
        oldMatrix[0] * rotateMatrix[2] +
        oldMatrix[2] * rotateMatrix[3] +
        oldMatrix[4] * 0
      const e =
        oldMatrix[0] * rotateMatrix[4] +
        oldMatrix[2] * rotateMatrix[5] +
        oldMatrix[4] * 1
      const b =
        oldMatrix[1] * rotateMatrix[0] +
        oldMatrix[3] * rotateMatrix[1] +
        oldMatrix[5] * 0
      const d =
        oldMatrix[1] * rotateMatrix[2] +
        oldMatrix[3] * rotateMatrix[3] +
        oldMatrix[5] * 0
      const f =
        oldMatrix[1] * rotateMatrix[4] +
        oldMatrix[3] * rotateMatrix[5] +
        oldMatrix[5] * 1
      return [a, b, c, d, e, f]
    } else {
      // 如果dom没有矩阵信息，直接返回rotate矩阵信息
      return rotateMatrix
    }
  }

  // 旋转dom
  rotate(rotateMatrix, angle) {
    if (this.options.direction === 'clockwise' && angle < 0) return
    if (this.options.direction === 'anti-clockwise' && angle > 0) return
    const matrix = this.cTransformMatrix(this.transformMatrix, rotateMatrix)
    this.$element.style.transform = `matrix(${matrix.join(',')})`

    this.angle += angle
    this.transformMatrix = matrix

  }

  // 绑定事件
  addEventListener() {

    this.startHandler.forEach((handlerName) => {
      this.$element.addEventListener(handlerName, this.handleStart)
    })

    this.moveHandler.forEach((handlerName) => {
      this.$element.addEventListener(
        handlerName,
        this.handleMove,
        { passive: false }
      )
    })

    this.endHandler.forEach((handlerName) => {
      this.$element.addEventListener(handlerName, this.handleEnd)
    })
  }

  start(e) {
    this.startTag = true
    console.log(this)
    const bound = this.$element.getBoundingClientRect()
    this.setCenterPoint(
      bound.left + bound.width / 2,
      bound.top + bound.height / 2
    )
    if (this.isMobile) {
      this.setFristPoint(e.touches[0].clientX, e.touches[0].clientY)
    } else {
      this.setFristPoint(e.clientX, e.clientY)
    }
  }

  move() {
    return throttle((e) => {
      e.preventDefault()

      if (this.startTag) {
        if (this.isMobile) {
          this.setLastPoint(e.touches[0].clientX, e.touches[0].clientY)
        } else {
          this.setLastPoint(e.clientX, e.clientY)
        }

        const { matrix: rotateMatrix, angle } = this.cRotateMatrix()

        this.rotate(rotateMatrix, angle)

        // 回调事件
        this.onListener['move'] && this.onListener['move'](this.angle)

        if (this.isMobile) {
          this.setFristPoint(e.touches[0].clientX, e.touches[0].clientY)
        } else {
          this.setFristPoint(e.clientX, e.clientY)
        }
      }
    }, 20)
  }

  end() {
    this.startTag = false
    this.onListener['end'] && this.onListener['end'](this.angle)
  }

  // 用户绑定回调事件
  on(handlerName, fn) {
    this.onListener[handlerName] = fn
  }

  // 用户解除绑定回调事件
  off(handlerName) {
    this.onListener[handlerName] = null
  }
  // 销毁
  destroy() {
    this.startHandler.forEach((handlerName) => {
      this.$element.removeEventListener(handlerName, this.handleStart)
    })

    this.moveHandler.forEach((handlerName) => {
      this.$element.removeEventListener(
        handlerName,
        this.handleMove,
        { passive: false }
      )
    })

    this.endHandler.forEach((handlerName) => {
      this.$element.removeEventListener(handlerName, this.handleEnd)
    })

    this.emptyData()
  }
}

