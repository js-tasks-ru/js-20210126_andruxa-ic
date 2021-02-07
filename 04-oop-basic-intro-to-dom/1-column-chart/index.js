export default class ColumnChart {
  constructor({data, label, value, link} = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.chartHeight = 50;
    this.render();
    this.update(this.data);    
    this.initEventListeners();
  }
  
  render() {
    const element = document.createElement('div');
  
    element.innerHTML = `
    <div class="column-chart" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>`;

    if (this.link) {element.querySelector('.column-chart__title').insertAdjacentHTML('beforeend', `<a class="column-chart__link" href="${this.link}">View all</a>`);}

    this.element = element.firstElementChild;
  }
  
  update (data = []) {
    let chart = this.element.querySelector('.column-chart__chart');
    if (data && data.length > 0) {
      for (let item of data) {
        item = item * 50 / Math.max(...data);
        chart.insertAdjacentHTML('beforeend', `<div style="--value: ${ Math.floor(item)}" data-tooltip="${(item / 50 * 100).toFixed(0)}%"></div>`);
      }
    } else {
      this.element.classList.add('column-chart_loading');
    }
  }


  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }
  
  remove () {
    this.element.remove();
  }
  
  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
