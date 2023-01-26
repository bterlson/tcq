import Vue from 'vue';
import './footer.scss';
import template from './footer.html';

const Footer = template(
  Vue.extend({
    props: {
      user: undefined,
    },
    created() {
      this.user = (window as any).user;
    },
  })
);

export default Footer;
