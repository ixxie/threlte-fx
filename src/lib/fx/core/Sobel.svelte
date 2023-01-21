<script lang="ts">
	import { Pass } from '@threlte/core';
	import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

	import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

	export let x = 400;
	export let y = 400;

	const sobel = new ShaderPass(SobelOperatorShader);
	sobel.uniforms.resolution.value = { x, y };
</script>

<Pass pass={sobel} />
