// 当前设备是否是移动设备
export function isMobile() {
  const userAgent = navigator.userAgent.toLowerCase()
  // 用 test 匹配浏览器信息
  if (
    /ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(
      userAgent
    )
  ) {
    return true
  } else {
    return false
  }
}

// 获取节点class中的属性
export function getStyle(obj, attr) {
  return obj.currentStyle
    ? obj.currentStyle[attr]
    : getComputedStyle(obj, false)[attr]
}

// 节流
export function throttle(fn, wait) {
  var previous = 0
  return function () {
    var now = Date.now()
    var context = this
    var args = arguments
    if (now - previous > wait) {
      fn.apply(context, args)
      previous = now
    }
  }
}