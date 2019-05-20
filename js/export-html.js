exportLinks.forEach(link => link.onclick = (e) => {
  const link = e.target
  const fileExtension = link.dataset.fileExtension;
  let markdown
  // here we can add more cases for more exporters
  switch(fileExtension) {
    case 'html':
      markdown = previewDiv.innerHTML
      break;
    case 'md':
      markdown = input.value
      break;
  }
  link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(markdown);
  link.download = `markdown.${fileExtension}`;
})

