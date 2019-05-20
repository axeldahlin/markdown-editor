const input = document.querySelector('#input');
const previewDiv = document.querySelector('#preview-div');
const exportLinks = document.querySelectorAll('.dropdown-item');

window.onload = () => {
  input.value = 'Write your markdown here...'
  input.focus()
  updatePreview()
};

input.addEventListener('input', updatePreview);
  
function updatePreview() {
  while (previewDiv.firstChild) {
    previewDiv.removeChild(previewDiv.firstChild);
  }
  createCompleteHtml().forEach(htmlElement => {
    previewDiv.appendChild(htmlElement)
  })
}



