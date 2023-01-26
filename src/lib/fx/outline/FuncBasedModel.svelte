<script lang="ts">
	import {
		initModel,
		initBackgroundModel,
		initShadowModel,
		initDepthModel,
		initEdgesModel,
		initConditionalModel
	} from './funcs.js';
	import { T, Three, useFrame } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	export let model = 'cabin.glb';

	let params = {
		colors: 'LIGHT',
		backgroundColor: '#0d2a28',
		modelColor: '#0d2a28',
		lineColor: '#ffb400',
		shadowColor: '#44491f',

		lit: false,
		opacity: 0.85,
		threshold: 40,
		displayConditionalEdges: true,
		thickness: 1,
		useThickLines: false,
		model: 'HELMET',

		lightModel: 0xffffff,
		lightLines: 0x455a64
	};

	let rotation = 0;
	useFrame(() => {
		rotation += 0.01;
	});

	const url =
		'https://rawgit.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF/FlightHelmet.gltf';
	const { gltf } = useGltf(`./models/${model}`);

	$: console.log($gltf);

	$: originalModel = initModel($gltf);
	$: edgesModel = initEdgesModel(originalModel, params);
	$: backgroundModel = initBackgroundModel(originalModel, params);
	$: shadowModel = initShadowModel(originalModel, params);
	$: depthModel = initDepthModel(originalModel, params);
	$: conditionalModel = initConditionalModel(originalModel, params);
	$: models = [
		originalModel,
		edgesModel,
		backgroundModel,
		shadowModel,
		depthModel,
		conditionalModel
	];
</script>

<T.Group rotation.y={rotation}>
	{#each models as model}
		{#if model}
			<Three type={model} scale={20} />
		{/if}
	{/each}
</T.Group>
