import { createRoot} from 'react-dom';

import App from './App';
import { encGlobalVar } from '~core/apolloClient'
import { create } from 'domain';

const root = document.getElementById('root');
const root = createRoot(root);
root.render(<App />);

