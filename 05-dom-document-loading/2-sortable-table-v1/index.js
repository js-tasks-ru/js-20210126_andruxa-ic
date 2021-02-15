export default class SortableTable {
  subElements = {};
  constructor(header = [], {data = []} = {}) {
    this.header = header;
    this.data = data;
    
    this.getTemplate();
  }

  getTemplate() {
    const div = document.createElement('div');

    div.insertAdjacentHTML('beforeend', 
      `<div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.getHeaderTemplate(this.header)}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.getBodyTemplate(this.data)}
          </div>
        </div>
      </div>
    `);
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
  
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
  
      return accum;
    }, {});
  }
 
  getHeaderTemplate(header) {
    let result = '';
    for (let col of header) {
      result += `
        <div class="sortable-table__cell" data-id="${col.id}" data-sortable="${col.sortable}">
          <span>${col.title}</span>
        </div>`;      
    }
    return result;
  }

  addArrow(fieldId, order) {
    for (let colItem of this.subElements.header.querySelectorAll('[data-id]')) {
      const arrow = colItem.querySelector('span[data-element="arrow"]');
      
      if (arrow) {arrow.remove();}
      colItem.removeAttribute('data-order', order);
      
      if (fieldId === colItem.dataset.id) {
        colItem.setAttribute('data-order', order);
        colItem.insertAdjacentHTML('beforeend', `<span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span></span>`);
      }
    }
  }

  getBodyTemplate(data) {
    let result = '';
    result += data.map((item) => {
      let row = `<a href="/products/${item.id}" class="sortable-table__row">`;
      for (let col of this.header) {
        row += (col.template) ? col.template(item[col.id]) : `<div class="sortable-table__cell">${item[col.id]}</div>`;
      }
      row += '</a>';
      return row;
    }).join('');

    return result;
  }

  update(data) {
    this.subElements.body.innerHTML = this.getBodyTemplate(data);
  }

  sort(id = '', order) {
    if (!this.getFieldSortParams(id).sortable) {return;}
    this.update(this.sortObjects(this.data, id, order));
    this.addArrow(id, order);
  }

  getFieldSortParams(sortField) {
    for (let col of this.header) {
      if (col.id === sortField) {return {sortType: col.sortType, sortable: col.sortable};}
    }
  }

  sortObjects(arr, sortField, param = 'asc') {
    const result = [...arr];

    function compare (base, target) {
      switch (this.getFieldSortParams(sortField).sortType) {
      case 'string':
        return base[sortField].localeCompare(target[sortField], ['ru', 'en'], {caseFirst: 'upper'});
      case 'number':
        return base[sortField] - target[sortField];
      }
    }
    
    switch (param.toLowerCase()) {
    case 'asc':
      return result.sort((a, b) => compare.bind(this)(a, b));
    case 'desc':
      return result.sort((a, b) => compare.bind(this)(b, a));
    }
  }  

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

