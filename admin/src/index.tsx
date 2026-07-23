import { PLUGIN_ID } from './pluginId';
import QuickFilterBar from './components/QuickFilterBar';

export default {
  register() {},
  bootstrap(app: any) {
    const contentManagerPlugin = app.getPlugin('content-manager');

    contentManagerPlugin?.injectComponent?.('listView', 'actions', {
      name: `${PLUGIN_ID}-bar`,
      Component: QuickFilterBar,
    });
  },
};
