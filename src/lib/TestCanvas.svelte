<script lang="ts">
	import {
		Canvas,
		DirectionalLight,
		PerspectiveCamera,
		OrbitControls,
		AmbientLight
	} from '@threlte/core';

	import { browser } from '$app/environment';
	let width = 600;
	let height = 600;
	if (browser) {
		width = window.innerWidth;
		height = window.innerHeight;
	}
</script>

<Canvas size={{ width, height }}>
	<PerspectiveCamera fov={50} position={{ x: 20, y: -20, z: 10 }} lookAt={{ x: 1, y: 1, z: 1 }}>
		<OrbitControls enableDamping />
	</PerspectiveCamera>
	<AmbientLight intensity={2} />
	<DirectionalLight intensity={1} position={{ x: 3, y: 10, z: 3 }} />
	<slot />
</Canvas>
