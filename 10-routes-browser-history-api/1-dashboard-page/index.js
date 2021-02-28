import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  range = {to: new Date(), from: new Date(Date.now() - 31 * 1000 * 60 * 60 * 24)};

  updateRange = async ({detail}) => {
    const {from, to} = detail;

    this.progressBar.hidden = false;

    this.charts.forEach(chart => {
      chart.loadData(from, to);
    });

    this.sortableTable.url.searchParams.set('from', from.toISOString());
    this.sortableTable.url.searchParams.set('to', to.toISOString());

    const {id, order} = this.sortableTable.sorted;
    this.sortableTable.sortOnServer(id, order);

    this.progressBar.hidden = true;
  };

  constructor () {
    this.rangePicker = new RangePicker(this.range);
    this.rangePicker.element.addEventListener('date-select', this.updateRange);
  }

  get topPanel() {
    const div = this.makeDiv(['content__top-panel']);

    div.innerHTML = '<h2 class="page-title">Панель управления</h2>';

    div.append(this.rangePicker.element);

    this.subElements['rangePicker'] = this.rangePicker.element;

    return div;
  }

  get dashboardPanel() {
    const div = this.makeDiv(['dashboard__charts']);

    this.charts = [
      new ColumnChart({
        url: 'api/dashboard/orders',
        range: this.range,
        label: 'orders',
        link: '#'
      }),
      new ColumnChart({
        url: 'api/dashboard/sales',
        range: this.range,
        label: 'sales',
        formatHeading: data => `$${data}`
      }),
      new ColumnChart({
        url: 'api/dashboard/customers',
        range: this.range,
        label: 'customers',
      })];

    this.charts.forEach(chart => {
      chart.element.classList.add(`dashboard__chart_${chart.label}`);
      div.append(chart.element);
      this.subElements[chart.label + 'Chart'] = chart.element;
    });

    return div;
  }

  get sortableTablePanel() {
    const div = this.makeDiv(['sortable-table']);

    this.sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
      isSortLocally: true,
      step: 40,
      start: 0
    });
    
    div.append(this.sortableTable.element);

    this.subElements['sortableTable'] = this.sortableTable.element;
    return div;
  }

  render() {
    this.progressBar = document.body.querySelector('.progress-bar');
    this.progressBar.hidden = false;
    const div = this.makeDiv(['dashboard', 'full-height', 'flex-column']);

    div.append(this.topPanel);
    div.append(this.dashboardPanel);
    div.insertAdjacentHTML('beforeend', '<h3 class="block-title">Лидеры продаж</h3>');
    div.append(this.sortableTablePanel);

    this.element = div;
    
    this.progressBar.hidden = true;
    return this.element;
  }

  makeDiv(classList = []) {
    const div = document.createElement('div');
    div.classList.add(...classList);  

    return div;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
