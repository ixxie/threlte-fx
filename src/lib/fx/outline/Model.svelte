<script lang="ts">
	import { useThrelte } from '@threlte/core';
	import { GLTF } from '@threlte/extras';

	import { OutlineEffect } from './main.js';

	import { onMount } from 'svelte';

	export let model = 'cabin.glb';

	let gltf;
	const { scene } = useThrelte();
	const addEffect = () => {
		new OutlineEffect(scene, gltf);
	};
</script>

<GLTF
	bind:gltf
	on:load={addEffect}
	castShadow
	receiveShadow
	url={`./models/${model}`}
	scale={1}
	position={{ x: 0, y: 0, z: 0 }}
/>
