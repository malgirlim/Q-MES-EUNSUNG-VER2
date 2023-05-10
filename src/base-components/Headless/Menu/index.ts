import Menu from "./Menu.vue";
import Button from "./Button.vue";
import Items from "./Items.vue";
import Item from "./Item.vue";
import Devider from "./Devider.vue";
import Header from "./Header.vue";
import Footer from "./Footer.vue";

const TabComponent = Object.assign({}, Menu, {
  Button: Button,
  Items: Items,
  Item: Item,
  Devider: Devider,
  Header: Header,
  Footer: Footer,
});

export default TabComponent;
