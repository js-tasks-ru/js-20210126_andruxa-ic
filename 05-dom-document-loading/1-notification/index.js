export default class NotificationMessage {
  constructor(text, {duration = 2000, type = 'success'} = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;
    this.makeNotification();
  }

  makeNotification() {
    const div = document.createElement('div');
    div.innerHTML = `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">${this.text}</div>
      </div>
    </div>`;
    this.element = div.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.activeMessage) {NotificationMessage.activeMessage.remove();}
    NotificationMessage.activeMessage = this.element;

    target.append(this.element);

    setTimeout(() => {this.remove();}, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.activeMessage = null;
  }
}
