// Styles Barrel
import App from './components/App.module.scss';
import Navbar from './components/Navbar.module.scss';
import TopicPanel from './components/TopicPanel.module.scss';
import TopicCard from './components/TopicCard.module.scss';
import PracticeEditor from './components/PracticeEditor.module.scss';
import CodeViewer from './components/CodeViewer.module.scss';
import Footer from './components/Footer.module.scss';
import variables from './_variables.module.scss';

export const styles = {
  App,
  Navbar,
  TopicPanel,
  TopicCard,
  PracticeEditor,
  CodeViewer,
  Footer
};

export const theme = variables;
