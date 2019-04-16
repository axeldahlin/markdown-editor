const input = document.querySelector('#input');
const previewDiv = document.querySelector('#preview-div');
const exportLinks = document.querySelectorAll('.dropdown-item');

window.onload = () => {
  input.value = 'Write your markdown here...'
  input.focus()
  updatePreview()
};

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

input.addEventListener('input', updatePreview);
  
function updatePreview() {
  while (previewDiv.firstChild) {
    previewDiv.removeChild(previewDiv.firstChild);
  }
  createCompleteHtml().forEach(htmlElement => {
    previewDiv.appendChild(htmlElement)
  })
}

function createCompleteHtml() {
  const paragraphs = input.value.split("\n");
  const processedParagraphs = paragraphs.map(paragraph => processParagraph(paragraph))
  let htmlElements = processedParagraphs.map(paragraph => createHtmlElement(paragraph))
  htmlElements = htmlElements.filter(element => element.innerHTML !== '')
  htmlElements = addSections(htmlElements)
  return htmlElements
}

function processParagraph(paragraph) {
  let header = 0;
  while (paragraph.charAt(0) == '#') {
    paragraph = paragraph.substr(1);
    header++;
  }
  const type = (header == 0) ? 'p' : 'h' + header
  return {type,
          content: splitParagraph(paragraph)};
}

function splitParagraph(text) {
  function indexOrEnd(character) {
    const index = text.indexOf(character);
    return index == -1 ? text.length : index;
  }

  function takeNormal() {
    // closest next bold/italic/img/end
    // in this array we can add indexOrEnd('*'), indexOrEnd('[') etc for more document/text items 
    const end = [indexOrEnd('**'), text.length].sort((a,b) => a-b)[0]
    const part = text.slice(0, end);
    text = text.slice(end);
    return part;
  }

  function takeUpTo(character) {
    const end = text.indexOf(character, 2);
    let part
    if (end == -1) {
      part = text
      text = ''
      return part;
    } else {
      part = text.slice(2, end);
      text = text.slice(end + 2);
      return part;
    }
  }

  const fragments = [];

  while (text != '') {
    // in this switch statemnentwe can add logic for more document/text items 
    switch(text.charAt(0)) {
      case '*':
        if (text.charAt(1) == '*') {
          fragments.push(
            {type: "bold",
             content: takeUpTo('**')});
        } else {
          // add logic for italic in future itaration
        }
        break;
      default:
        fragments.push(
          {type: 'normal',
           content: takeNormal()});
        break; 
    } 
  }
  return fragments;
}

function createHtmlElement(element) {
  function createStrong(part) {
    return `<strong>${part.content}</strong>`;
  }
  // here we can add createItalic(), createImg() etc
  const thisElement = document.createElement(element.type)
  const innerHTML = element.content === undefined ? '' : element.content.map(part => {
    if (part.type == 'normal') {
      return part.content
    } 
    else if (part.type == 'bold')  {
      return createStrong(part)
    }
  }).join('')
  thisElement.innerHTML = innerHTML
  return thisElement
}

function addSections(elements) {
  let newHtml = []
  // first and second level section indexes
  let prevFirstIndex = undefined
  let prevSecondIndex = undefined

  for (let i = 0; i < elements.length; i++) {
    switch(elements[i].localName) {
      case 'h1':
        newHtml.push(document.createElement('section'))
        prevFirstIndex = newHtml.length -1
        newHtml[prevFirstIndex].innerHTML += elements[i].outerHTML
        prevSecondIndex = undefined
        break;
      case 'h2':
        if (prevFirstIndex === undefined) {
          newHtml.push(document.createElement('section'))
          prevSecondIndex = newHtml.length -1
          newHtml[prevSecondIndex].innerHTML += elements[i].outerHTML
        } 
        else {
          newHtml[prevFirstIndex].innerHTML += `<section>${elements[i].outerHTML}</section>`
          prevSecondIndex = newHtml[prevFirstIndex].childNodes.length -1
        }
        break;
        // here we take care of cases 'p', 'img', 'a' etc like this:
      default:
        if (prevFirstIndex === undefined) {
          newHtml.push(elements[i])
        }
          else if (prevSecondIndex === undefined) {
            newHtml[prevFirstIndex].innerHTML += elements[i].outerHTML
        } 
          else {
            newHtml[prevFirstIndex].childNodes[prevSecondIndex].innerHTML += elements[i].outerHTML
        } 
        break;
    }
  }
  return newHtml
}