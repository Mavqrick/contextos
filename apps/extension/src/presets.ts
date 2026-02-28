import { mount } from 'svelte';
import Presets from './Presets.svelte';

const app = mount(Presets, { target: document.getElementById('app')! });

export default app;