<script lang="ts">
	import { Pass, useTexture, useThrelte } from '@threlte/core';

	import { Color, RawShaderMaterial } from 'three';

	import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

	import { getFBO } from './utils/FBO.js';
	import { shader as orthoVs } from './shaders/ortho-vs.js';

	import fragmentShader from './shader.js';

	const paperTexture = useTexture('./paper.jpg');

	const shader = new RawShaderMaterial({
		uniforms: {
			paperTexture: { value: paperTexture },
			colorTexture: { value: getFBO(1, 1).texture },
			normalTexture: { value: getFBO(1, 1).texture },
			inkColor: { value: new Color(255, 0, 0) },
			scale: { value: 40 },
			thickness: { value: 2.5 }
		},
		vertexShader: orthoVs,
		fragmentShader
	});

	const pass = new ShaderPass(shader);
</script>

<Pass {pass} />
