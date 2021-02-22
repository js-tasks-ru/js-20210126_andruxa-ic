export default class ColumnChart {
  subElements = {};
  chartHeight = 50;

  BASE_URL = 'https://course-js.javascript.ru/';

  constructor({url = '', range = {from: new Date(), to: new Date()}, label = '', link = '', formatHeading = data => data, value = ''} = {}) {
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.value = value;

    this.uri = new URL(url, this.BASE_URL);

    this.render();

    this.update(range.from, range.to);
  }
    
  async fetchData (from, to) {

    this.uri.searchParams.set('from', from.toISOString());
    this.uri.searchParams.set('to', to.toISOString());

    let response = await fetch(this.uri);
    let result = await response.json();

    return result;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
  
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
  
      return accum;
    }, {});
  }

  render() {
    const element = document.createElement('div');
    
    element.innerHTML = `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">Total ${this.label}
        ${(this.link) ? `<a class="column-chart__link" href="${this.link}">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.value}</div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>`;
  
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }
  
  calculateValue(data = []) {
    return data.reduce((acc, val) => acc += val);
  }

  getScaledData(data = {}) {
    let scale = this.chartHeight / Math.max(...Object.values(data));
    return Object.entries(data).map(([date, value]) => [date, Math.floor(value * scale)]); 
  }

  async update (from, to) {
    const result = await this.fetchData(from, to);

    const data = this.getScaledData(result) || [];
    const calculatedValue = this.calculateValue(Object.values(result));

    if (data.length) {
      this.subElements.header.innerHTML = (this.formatHeading) ? this.formatHeading(calculatedValue) : calculatedValue;

      this.subElements.body.innerHTML = data.map(([date, item]) => {
        return `<div style="--value:${item}" data-tooltip="<div><small>${new Date(date).toLocaleDateString('ru', {
          year: "numeric",
          month: "short",
          day: "numeric"
        })}</small></div><strong>${this.formatHeading(result[date])}</strong>"></div>`;
      }).join('');
    }
    this.element.classList.remove('column-chart_loading');      
  }
    
  remove () {
    this.element.remove();
  }
    
  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
