import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  modes = {'save': 'product-saved', 'update': 'product-updated'};
  defaultProduct = {
    title: '',
    description: '',
    quantity: 0,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor (productId) {
    this.productId = productId;
    if (productId) {
      this.mode = 'update';
    } else {
      this.mode = 'save';
    }
  }

  async render () {
    const catPromise = this.getCategories();

    const prodPromise = this.productId 
      ? this.getProduct(this.productId)
      : this.defaultProduct;

    const [catData, prodResponse] = await Promise.all([catPromise, prodPromise]);

    this.product = prodResponse;
    this.categories = catData;
    
    this.element = this.formTemplate;    
    this.populateForm(this.product);

    this.subElements.productForm.uploadImage.addEventListener('click', this.upload);
    this.subElements.productForm.addEventListener('submit', this.sendToServer);

    return this.element;
  }
  

  sendToServer = async (event) => {
    event.preventDefault();

    const formObject = this.populateObject(this.subElements.productForm);

    let response = await fetch(new URL('api/rest/products', BACKEND_URL), {
      method: 'PATCH',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(formObject)
    });

    let result = await response.json();
    
    this.element.dispatchEvent(new CustomEvent(this.modes[this.mode], {detail: result, bubbles: true}));
  }

  async getProduct (productId) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', productId);

    return (await fetchJson(url))[0];
  }

  populateObject (form) {
    if (!form) {return;}

    const result = {id: this.productId};

    const fd = new FormData(form);
    let img = {};
    const images = [];

    for (let [key, value] of fd) {
      if (key === 'url' || key === 'source') {
        switch (key) {
        case 'url':
          img[key] = value;
          continue;
        case 'source':
          img[key] = value;
          images.push(img);
          img = {};
        } 
      } else {
        if (form[key].type === 'number' || key === 'status') {
          result[key] = parseInt(value);
        } else {
          result[key] = value;
        }
      }
    }
    result['images'] = images;
    return result;
  }

  populateForm (product = {}) {
    if (!product.id) {return;}

    if (product.images.length) {
      const sortableList = new SortableList({items: this.getImageListTemplate(product.images)});
      this.subElements.imageListContainer.append(sortableList.element);
    }

    const form = this.subElements.productForm;
    
    [...form.elements].filter(el => el.name && !['button', 'submit', 'hidden'].find(item => item === el.type))
      .forEach(el => {
        el.value = product[el.name];
      });
  }

  get formTemplate () {
    const div = document.createElement('div');
    div.classList.add('product-form');
    div.innerHTML = `
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
        ${this.getCategoryListTemplate(this.categories)}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="${this.defaultProduct.price}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="${this.defaultProduct.discount}">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="${this.defaultProduct.quantity}">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
    `;

    this.subElements = this.getSubElements(div);

    return div;
  }

  getImageListTemplate(data = []) {
    return data.map(image => {
      const li = document.createElement('li');
      li.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button></li>`;
      return li.firstElementChild;});
  }

  async getCategories () {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const categories = await fetchJson(url);

    return categories;
  }

  getCategoryListTemplate (data = []) {
    return data.map(cat => cat.subcategories.map(sub => `<option value="${sub.id}">${cat.title} &gt; ${sub.title}</option>`).join('')).join('');
  }

  upload = () => {

    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      const formData = new FormData();
  
      formData.append('image', fileInput.files[0]);
  
      try {
        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        });
  
        let image = {};
        if (result.data.link) {
          const filename = (new URL(result.data.link)).pathname.slice(1);
          image = {url: result.data.link, source: filename};
        }

        this.subElements.imageListContainer.firstElementChild.insertAdjacentHTML('beforeend', this.getImageListTemplate([image]));

      } catch (err) {
        throw err;
      }
    };
    
    fileInput.click();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
  
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
  
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
