const LINEAR_MENU_SELECTOR = '.linear-menu';
const PROFILE_EDIT_HEADING_SELECTOR = '.profile-edit__heading';
const PROFILE_EDIT_MENU_SELECTOR = '.profile-edit__list';
const STATS_TABS_SELECTOR = '.stats__tabs';
const STATS_DIAGRAM_SELECTOR = '.stats__diagram-tab';
const GRAPH_COLORS = {
  green: '#41ac6d',
  orange: '#ee2e14',
  yellow: '#d8ab19'
};

(function() {
  fetchContent('en')

  let radios = document.querySelectorAll('.language-selector__radio')
  radios.forEach(radio => radio.addEventListener('click', selectLanguage))

})()

function fetchContent (lang) {
  let url = `json/content-${lang}.json`,
    call = new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()
      xhr.open('GET', url)
      xhr.onload = () => resolve(JSON.parse(xhr.response))
      xhr.onerror = () => reject(xhr.statusText)
      xhr.send();
    })

    call.then(response => setPageContent(response))
}

function selectLanguage (event) {
  let lang = event.target.value
  fetchContent(lang)
}

function setPageContent (pageContent) {
  renderContent(LINEAR_MENU_SELECTOR, pageContent.linearMenu)
  renderProfileEdit(pageContent.profileEdit)
  renderStats(pageContent.stats)
}

// Using handlebars
function renderContent (selector, listContent) {
  let stringTemplate = document.querySelector(`${selector}--template`).innerHTML,
    template = Handlebars.compile(stringTemplate),
    listHtml = template(listContent)
  
  document.querySelector(selector).innerHTML = listHtml
}

function renderProfileEdit (profileContent) {
  renderSection(PROFILE_EDIT_HEADING_SELECTOR, profileContent.heading)
  renderList(PROFILE_EDIT_MENU_SELECTOR, profileContent.menu)
}

function renderSection (selector, sectionContent) {
  let sectionTemplate = document.querySelector(`${selector}--template`).innerHTML,
      html = sectionTemplate

    for (const key in sectionContent) {
      html = html.replace(new RegExp(`{{ ${key} }}`, 'g'), sectionContent[key])
    }

    document.querySelector(selector).innerHTML = html;
}

function renderList (selector, listContent) {
  let template = document.querySelector(`${selector}--template`).innerHTML,
    html,
    listHtml = ''

  listContent.forEach(listItem => {
    html = template 
    for(const text in listItem) {
      html = html.replace(new RegExp(`{{ ${text} }}`, 'g'), listItem[text])
    }
    listHtml += html
  });
  
  document.querySelector(selector).innerHTML = listHtml
}

function renderStats (statsContent) {
  renderContent(STATS_TABS_SELECTOR, statsContent)
  renderContent(STATS_DIAGRAM_SELECTOR, statsContent.tabs[0].content)

  const data = processData(statsContent.tabs[0].content.data),
    ctx = document.getElementById('stats-graph').getContext('2d')
    chart = new Chart(ctx, {
      type: 'pie',
      data,
      options: {
        legend: {
          display: false
        }
      }
    })
}

function processData (data) {
  const labels = Object.keys(data),
    values = Object.values(data).map(dataItem => dataItem.value),
    colors = Object.values(data).map(dataItem => dataItem.color).map(color => GRAPH_COLORS[color])

  let diference = 100 - values.reduce((total, value) => total + value, 0)

  if (diference > 0) {
    values.push(diference)
    labels.push('other')
  }
  return {
    datasets: [{
      data: values,
      backgroundColor: colors
    }],
    labels
  }
}
