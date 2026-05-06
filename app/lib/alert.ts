export function showAlert(message: string) {
  const el = document.createElement('div')
  el.innerText = message

  el.style.position = 'fixed'
  el.style.bottom = '20px'
  el.style.right = '20px'
  el.style.background = '#111'
  el.style.color = '#fff'
  el.style.padding = '12px 18px'
  el.style.borderRadius = '8px'
  el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)'
  el.style.zIndex = '9999'
  el.style.animation = 'fadeIn 0.3s ease'

  document.body.appendChild(el)

  setTimeout(() => {
    el.remove()
  }, 2000)
}
