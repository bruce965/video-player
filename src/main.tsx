// SPDX-FileCopyrightText: Copyright 2023 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { createRoot } from 'react-dom/client';
import { App } from './components/app';

const app = document.getElementById('app');
if (app == null)
    throw new Error("Missing app element.");

const root = createRoot(app)
root.render(<App />);
