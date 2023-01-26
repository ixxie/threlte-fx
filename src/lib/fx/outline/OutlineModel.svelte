<script lang="ts">
	import { initOriginalModel, initFillModel, initLineModel, initOutlineModel } from './funcs.js';
	import { T, Three, useFrame } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	export let model = 'airplane.glb';

	let params = {
		fill: {
			color: '#ffffff',
			opacity: 0.75
		},
		line: {
			color: '#455a64',
			threshold: 10,
			width: 30 // broken
		}
	};

	let rotation = 0;
	useFrame(() => {
		rotation += 0.01;
	});

	const { gltf } = useGltf(`./models/${model}`);

	$: originalModel = initOriginalModel($gltf);
	$: lineModel = initLineModel(originalModel, params);
	$: fillModel = initFillModel(originalModel, params);
	$: outlineModel = initOutlineModel(originalModel, params);
	$: models = [lineModel, fillModel, outlineModel];
</script>

<T.Group rotation.y={rotation}>
	{#each models as model}
		{#if model}
			<Three type={model} scale={0.5} rotation.z={-0.2} />
		{/if}
	{/each}
</T.Group>
