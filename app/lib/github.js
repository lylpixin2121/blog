

const moment = require('moment');

module.exports = class Github {
  constructor(app) {
    this.app = app;
    this.config = app.config.github;
  }

  get option() {
    return {
      auth: `${this.config.name}:${this.config.token}`,
      dataType: 'json',
      timeout: 60000,
    };
  }

  get repo() {
    return `repos/${this.config.name}/${this.config.repo}`;
  }

  request(url, option) {
    return this.app
      .curl(`https://api.github.com/${url}`, Object.assign(this.option, option))
      .then(({ data }) => Promise.resolve(data));
  }

  user() {
    return this.request('user');
  }

  blog() {
    return this.request(`${this.repo}/contents/docs`);
  }

  issue(title, body, number) {
    if (!title && !body && !number) {
      return this.request(`${this.repo}/issues?creator=${this.config.name}`);
    }

    return this.request(`${this.repo}/issues${number ? '/' + number : ''}`, {
      method: number ? 'PATCH' : 'POST',
      data: JSON.stringify({
        title,
        body,
      }),
    });
  }

  commit(sha, since) {
    if (typeof since === 'number') {
      since = moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DDTHH:MM:SSZ');
    }

    return this.request(
      `${this.repo}/commits${sha ? '/' + sha : ''}${since ? '?since=' + since : ''}`
    );
  }
};
