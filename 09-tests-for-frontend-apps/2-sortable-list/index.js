export default class SortableList {

    elementActions = (event) => {
      const closestLi = event.target.closest('li');  

      if (closestLi) {
        if (event.target.closest('[data-delete-handle]')) {
          event.preventDefault();
          closestLi.remove();
        }
        if (event.target.closest('[data-grab-handle]')) {
          event.preventDefault();
          this.grabHandler(event);
        }
      }
    }
  
    grabHandler = (event) => {
      const parentUl = event.target.closest('ul');
      const closestLi = event.target.closest('li');

      const liWidth = closestLi.getBoundingClientRect().width;
      const liHeight = closestLi.getBoundingClientRect().height;

      const placeholder = document.createElement('div');
      placeholder.classList.add('sortable-list__placeholder');
      placeholder.style.width = liWidth + 'px';
      placeholder.style.height = liHeight + 'px';
      
      const shiftX = event.clientX - closestLi.getBoundingClientRect().left;
      const shiftY = event.clientY - closestLi.getBoundingClientRect().top;

      closestLi.style.width = liWidth + 'px';
      closestLi.style.height = liHeight + 'px';
      closestLi.style.position = 'fixed';
      closestLi.style.zIndex = 1000;
      
      closestLi.replaceWith(placeholder);

      const onMouseMove = (event) => {

        closestLi.style.left = event.clientX - shiftX + 'px';
        closestLi.style.top = event.clientY - shiftY + 'px';

        closestLi.classList.add('sortable-list__item_dragging');
        
        closestLi.style.pointerEvents = 'none';
        const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        closestLi.style.pointerEvents = 'auto';

       
        if (elemBelow && elemBelow.closest('li')) {
          if (closestLi.getBoundingClientRect().top - elemBelow.getBoundingClientRect().top <= 0) {
            elemBelow.closest('li').after(placeholder);
          } else {
            elemBelow.closest('li').before(placeholder);
          }
        }

        const scrollStep = 20;
        if (event.clientY <= scrollStep) {
          window.scrollBy(0, -scrollStep);
        }
        if (document.documentElement.clientHeight - event.clientY <= scrollStep) {
          window.scrollBy(0, scrollStep);
        }

        parentUl.append(closestLi);        
      };

      const onPointerUp = () => {
        document.removeEventListener('pointermove', onMouseMove);
        closestLi.classList.remove('sortable-list__item_dragging');

        placeholder.replaceWith(closestLi);
        closestLi.style = '';
        document.removeEventListener('pointerup', onPointerUp);
      };

      document.addEventListener('pointermove', onMouseMove);
      document.addEventListener('pointerup', onPointerUp);  
      closestLi.ondragstart = function() {
        return false;
      };
    }

    constructor({items = []} = {}) {
      this.items = items;
      this.render();
      this.initEventHandlers();
    }

    render () {
      const list = document.createElement('ul');
      list.classList.add('sortable-list');
      this.items.forEach(li => {
        li.classList.add('products-edit__imagelist-item');
        li.classList.add('sortable-list__item');
        list.append(li);
      });
      this.element = list;
    }

    initEventHandlers() {
      this.element.addEventListener('pointerdown', this.elementActions);
    }

    remove () {
      this.element.remove();
    }

    destroy() {
      this.remove();
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointermove', onMouseMove);
    }
}
